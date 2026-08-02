import { Avatar } from '@/components/ui/Avatar';
import { cn, formatCurrency, formatRelativeTime } from '@/utils';
import { HeartHandshake } from 'lucide-react';
import type { LoyalCustomersSectionProps } from '../types';
import { DashboardDataTable, DashboardEmptyInsight, DashboardSection, statusToneClass } from './DashboardSectionPrimitives';

export function LoyalCustomersSection({ customers, presentationMode }: LoyalCustomersSectionProps) {
  return (
    <DashboardSection id="clientes" title="Clientes mais fiéis" subtitle="Ordenados por valor comprado, quantidade de pedidos e recorrência." icon={HeartHandshake} hidden={presentationMode}>
      {customers.length ? (
        <DashboardDataTable headers={['Cliente', 'Empresa', 'Total comprado', 'Pedidos', 'Última interação', 'Status', 'Ação sugerida']}>
          {customers.map(({ customer, status, action, tone }) => (
            <tr key={customer.id}>
              <td className="px-3 py-2.5"><div className="flex items-center gap-3"><Avatar name={customer.name} size="sm" /><span className="font-semibold text-gray-900 dark:text-white">{customer.name}</span></div></td>
              <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{customer.company || '-'}</td>
              <td className="px-3 py-2.5 font-semibold tabular-nums">{formatCurrency(customer.totalSpent)}</td>
              <td className="px-3 py-2.5 tabular-nums">{customer.ordersCount}</td>
              <td className="px-3 py-2.5 text-gray-500">{formatRelativeTime(customer.lastContact)}</td>
              <td className="px-3 py-2.5"><span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold ring-1', statusToneClass(tone))}>{status}</span></td>
              <td className="min-w-44 px-3 py-2.5 text-gray-700 dark:text-gray-300">{action}</td>
            </tr>
          ))}
        </DashboardDataTable>
      ) : <DashboardEmptyInsight text="Ainda não há clientes suficientes para identificar fidelidade e recorrência." />}
    </DashboardSection>
  );
}
