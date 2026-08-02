import {
  mockConversations,
  mockCustomers,
  mockMessages,
  mockProducts,
  getCustomerDetail,
} from '@/data/mocks';
import type { AgentContext, Message } from '@/types';
import { formatCurrency } from '@/utils';
import { detectIntentFromContext, getPlaybook } from './conversationPlaybooks';

export function buildAiContext(options: {
  conversationId?: string;
  customerId?: string;
  history?: Message[];
}): AgentContext {
  const conversation = options.conversationId
    ? mockConversations.find((c) => c.id === options.conversationId)
    : undefined;

  const customerId = options.customerId ?? conversation?.customerId;
  const customer = customerId
    ? mockCustomers.find((c) => c.id === customerId)
    : undefined;

  const detail = customerId ? getCustomerDetail(customerId) : undefined;

  const storedMessages = options.conversationId
    ? mockMessages[options.conversationId] ?? []
    : [];

  const history = options.history?.length ? options.history : storedMessages;

  const lastCustomerMsg = [...history]
    .reverse()
    .find((m) => m.sender === 'customer')?.content;

  const productsSummary = mockProducts
    .slice(0, 8)
    .map((p) => `${p.code} (${p.name}): ${formatCurrency(p.price)}, estoque ${p.stock}`)
    .join('\n');

  return {
    conversation,
    customer,
    customerDetail: detail,
    messages: history,
    lastCustomerMessage: lastCustomerMsg ?? conversation?.lastMessage,
    productsCatalog: productsSummary,
  };
}

export function contextToPrompt(ctx: AgentContext): string {
  const playbook = getPlaybook(ctx.conversation?.id);
  const intent = detectIntentFromContext(ctx);

  const lines: string[] = [
    'Você é o Assistente ChatBô, plataforma de atendimento comercial B2B.',
    'Responda em português do Brasil, de forma profissional, empática e orientada a ação.',
    'Use SEMPRE os dados abaixo. Cite valores, estoque e prazos quando disponíveis.',
    'Para sugestões: escreva mensagens prontas para o atendente copiar e enviar ao cliente.',
    'Para resumos: inclua tom do cliente, urgência e próximo passo recomendado.',
  ];

  if (ctx.conversation) {
    lines.push(
      '',
      '## Conversa ativa',
      `- Cliente: ${ctx.conversation.customerName}`,
      `- Canal: ${ctx.conversation.channel}`,
      `- Status: ${ctx.conversation.status}`,
      `- Protocolo: ${ctx.conversation.protocol ?? 'N/A'}`,
      `- Departamento: ${ctx.conversation.department ?? 'N/A'}`,
      `- Intenção detectada: ${intent}`,
      `- Última mensagem: ${ctx.conversation.lastMessage}`,
      playbook ? `- Insight: ${playbook.insight}` : '',
    );
  }

  if (ctx.customer) {
    lines.push(
      '',
      '## Cliente',
      `- Nome: ${ctx.customer.name}`,
      `- Empresa: ${ctx.customer.company}`,
      `- Cidade: ${ctx.customer.city}`,
      `- Pedidos: ${ctx.customer.ordersCount} | Total: ${formatCurrency(ctx.customer.totalSpent)}`,
      ctx.customer.notes ? `- Observações: ${ctx.customer.notes}` : '',
    );
  }

  if (ctx.customerDetail?.orders.length) {
    lines.push('', '## Pedidos recentes');
    ctx.customerDetail.orders.forEach((o) => {
      lines.push(`- ${o.number}: ${o.status}, ${formatCurrency(o.total)}, ${o.items} itens`);
    });
  }

  if (ctx.messages.length) {
    lines.push('', '## Histórico recente');
    ctx.messages.slice(-8).forEach((m) => {
      const who = m.sender === 'customer' ? 'Cliente' : m.sender === 'ai' ? 'IA' : 'Atendente';
      lines.push(`${who}: ${m.content}`);
    });
  }

  lines.push('', '## Catálogo (amostra)', ctx.productsCatalog);

  return lines.filter(Boolean).join('\n');
}
