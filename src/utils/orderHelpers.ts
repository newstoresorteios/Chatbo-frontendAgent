import type { Order, OrderStatus } from '@/types';

export function formatOrderCustomerName(order: Order): string {
  const name = order.customerName?.trim();
  if (name) return name;
  if (order.status === 'pending') return 'Orçamento sem cliente';
  return 'Cliente não informado';
}

export function isOrderQuote(order: Order): boolean {
  return order.status === 'pending';
}

export function getOrderTypeLabel(order: Order): 'Orçamento' | 'Pedido' | 'Cancelado' {
  if (order.status === 'cancelled') return 'Cancelado';
  if (order.status === 'pending') return 'Orçamento';
  return 'Pedido';
}

export const orderStatusDescriptions: Record<OrderStatus, string> = {
  pending: 'Oportunidade identificada pelo ChatBô e aguardando confirmação comercial.',
  processing: 'Pedido confirmado e em processamento.',
  shipped: 'Enviado ou em trânsito — aguardando entrega ao cliente.',
  delivered: 'Entregue — receita concretizada nos relatórios.',
  cancelled: 'Pedido cancelado.',
};
