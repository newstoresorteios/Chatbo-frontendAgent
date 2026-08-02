import { Avatar } from '@/components/ui/Avatar';
import { formatRelativeTime } from '@/utils';
import { Users } from 'lucide-react';
import type { RecentCustomersSectionProps } from '../types';
import { DashboardEmptyInsight, DashboardSection } from './DashboardSectionPrimitives';

export function RecentCustomersSection({ customers, presentationMode }: RecentCustomersSectionProps) {
  return <DashboardSection id="clientes-recentes" title="Clientes recentes" subtitle="Leads e clientes mais novos, com próxima ação recomendada." icon={Users} hidden={presentationMode}>
    {customers.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{customers.map(({ customer, status, action }) => (
      <div key={customer.id} className="rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90">
        <div className="flex items-center gap-3"><Avatar name={customer.name} size="md" /><div className="min-w-0"><p className="truncate font-semibold text-gray-900 dark:text-white">{customer.name}</p><p className="truncate text-xs text-gray-500">{customer.company || customer.city || 'Cliente'}</p></div></div>
        <div className="mt-4 grid gap-2 text-sm">
          <p className="flex justify-between"><span className="text-gray-500">Última interação</span><strong>{formatRelativeTime(customer.lastContact)}</strong></p>
          <p className="flex justify-between"><span className="text-gray-500">Status</span><strong>{status}</strong></p>
          <p className="text-gray-600 dark:text-gray-300">{action}</p>
        </div>
      </div>
    ))}</div> : <DashboardEmptyInsight text="Sem clientes recentes carregados no período." />}
  </DashboardSection>;
}
