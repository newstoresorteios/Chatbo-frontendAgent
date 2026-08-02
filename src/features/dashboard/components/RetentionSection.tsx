import { cn, formatCurrency, formatDate } from '@/utils';
import { RefreshCw } from 'lucide-react';
import type { RetentionSectionProps } from '../types';
import { DashboardDataTable, DashboardEmptyInsight, DashboardSection, statusToneClass } from './DashboardSectionPrimitives';

export function RetentionSection({ customers, presentationMode }: RetentionSectionProps) {
  return <DashboardSection id="retencao" title="Retenção e reativação" subtitle="Clientes com histórico relevante que podem estar esfriando." icon={RefreshCw} hidden={presentationMode}>
    {customers.length ? <DashboardDataTable headers={['Cliente', 'Valor histórico', 'Última compra/interação', 'Dias sem compra', 'Risco', 'Sugestão de abordagem']}>
      {customers.map(({ customer, daysWithoutPurchase, risk, recommendedAction, tone }) => <tr key={customer.id}>
        <td className="px-3 py-2.5 font-semibold text-gray-900 dark:text-white">{customer.name}</td>
        <td className="px-3 py-2.5 font-semibold tabular-nums">{formatCurrency(customer.totalSpent)}</td>
        <td className="px-3 py-2.5 text-gray-500">{formatDate(customer.lastContact)}</td>
        <td className="px-3 py-2.5 tabular-nums">{daysWithoutPurchase}</td>
        <td className="px-3 py-2.5"><span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold ring-1', statusToneClass(tone))}>{risk}</span></td>
        <td className="min-w-64 px-3 py-2.5 text-gray-700 dark:text-gray-300">{recommendedAction}</td>
      </tr>)}
    </DashboardDataTable> : <DashboardEmptyInsight text="Nenhum cliente em risco de retenção detectado com os dados atuais." />}
  </DashboardSection>;
}
