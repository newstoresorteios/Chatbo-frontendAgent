import type { Customer } from '@/types';
import { daysSince } from './formatters';

export function getCustomerStatus(customer: Customer): 'Fiel' | 'Recorrente' | 'Novo' | 'Em risco' {
  if (daysSince(customer.lastContact) > 90 && customer.totalSpent > 0) return 'Em risco';
  if (customer.ordersCount >= 5 || customer.totalSpent >= 5000) return 'Fiel';
  if (customer.ordersCount >= 2) return 'Recorrente';
  return 'Novo';
}

export function getCustomerAction(customer: Customer): string {
  const status = getCustomerStatus(customer);
  if (status === 'Em risco') return 'Enviar proposta de reativação';
  if (status === 'Fiel') return 'Oferecer condição de recompra';
  if (status === 'Recorrente') return 'Sugerir produto relacionado';
  return 'Qualificar necessidade';
}
