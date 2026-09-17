import type { Order } from '@/types';

export type GlobalSearchScope = 'conversations' | 'orders';

export function globalSearchPath(query: string, scope: GlobalSearchScope): string | null {
  const normalized = query.trim();
  if (!normalized) return null;
  const route = scope === 'orders' ? '/pedidos' : '/atendimento';
  return `${route}?busca=${encodeURIComponent(normalized)}`;
}

export function orderConversationPath(order: Pick<Order, 'conversationEvidence'>): string | null {
  const conversationId = order.conversationEvidence?.conversationId?.trim();
  return conversationId ? `/atendimento?conversa=${encodeURIComponent(conversationId)}` : null;
}
