import type { Conversation, Customer, Order } from '@/types';
import type { LeadScore } from '../types';
import { daysSince } from './formatters';

export function hasBuyingIntent(message: string): boolean {
  return /or[cç]amento|pre[cç]o|valor|pedido|comprar|proposta|estoque|entrega|prazo/i.test(message);
}

export function scoreConversation(conv: Conversation, customers: Customer[], orders: Order[]): LeadScore {
  const customer = customers.find((item) => item.id === conv.customerId || item.name === conv.customerName);
  const customerOrders = orders.filter((order) => order.customerId === conv.customerId || order.customerName === conv.customerName);
  const recentInteraction = daysSince(conv.lastMessageAt) <= 2;
  const buyingIntent = hasBuyingIntent(conv.lastMessage);
  const waiting = conv.status === 'waiting';
  const recurring = (customer?.ordersCount ?? customerOrders.length) >= 2;
  const loyal = recurring && (customer?.totalSpent ?? customerOrders.reduce((sum, order) => sum + order.total, 0)) >= 5000;
  const noRecentOrder = customerOrders.length > 0 && daysSince(customerOrders[0]?.createdAt) > 60;

  let score = 35;
  if (recentInteraction) score += 15;
  if (buyingIntent) score += 25;
  if (waiting) score += 12;
  if (conv.unreadCount > 0) score += 8;
  if (recurring) score += 12;
  if (loyal) score += 10;
  if (noRecentOrder) score -= 12;
  if (conv.status === 'closed') score -= 15;
  score = Math.max(0, Math.min(100, score));

  let label: LeadScore['label'] = 'Frio';
  if (loyal) label = 'Cliente fiel';
  else if (waiting && score >= 55) label = 'Em risco';
  else if (score >= 75) label = 'Quente';
  else if (score >= 50) label = 'Morno';

  return {
    id: conv.id,
    customerName: conv.customerName,
    channel: conv.channel,
    score,
    label,
    reason: waiting
      ? 'Aguardando resposta'
      : buyingIntent
        ? 'Demonstrou intenção comercial'
        : loyal
          ? 'Cliente recorrente de alto valor'
          : recurring
            ? 'Cliente recorrente'
            : recentInteraction
              ? 'Interação recente'
              : 'Sem sinal comercial forte',
    lastInteraction: conv.lastMessageAt,
    nextAction: waiting
      ? 'Responder agora'
      : buyingIntent
        ? 'Enviar proposta comercial'
        : loyal
          ? 'Oferecer recompra'
          : 'Qualificar próximo passo',
  };
}
