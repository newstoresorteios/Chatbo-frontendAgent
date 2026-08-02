import type { ChannelType, Conversation, Order, Product } from '@/types';
import type { CommercialStatusFilter, PeriodFilter } from '../types';

export function periodCutoff(period: PeriodFilter, now = Date.now()): number {
  const days = period === 'today' ? 1 : period === '7d' ? 7 : period === 'month' ? new Date(now).getDate() : 30;
  return now - days * 86400000;
}

export function filterConversations(
  conversations: Conversation[],
  filters: { status: CommercialStatusFilter; channel: string; customer: string; cutoff: number },
): Conversation[] {
  return conversations.filter((conversation) => {
    if (filters.status !== 'all' && conversation.status !== filters.status) return false;
    if (filters.channel && conversation.channel !== (filters.channel as ChannelType)) return false;
    if (filters.customer && conversation.customerId !== filters.customer) return false;
    return new Date(conversation.lastMessageAt).getTime() >= filters.cutoff;
  });
}

export function filterOrders(orders: Order[], customer: string, cutoff: number): Order[] {
  return orders.filter((order) => (!customer || order.customerId === customer) && new Date(order.createdAt).getTime() >= cutoff);
}

export function filterProducts(products: Product[], product: string): Product[] {
  return products.filter((item) => !product || item.id === product);
}
