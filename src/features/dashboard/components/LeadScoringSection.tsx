import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { cn, formatRelativeTime } from '@/utils';
import { Target } from 'lucide-react';
import type { LeadScoringSectionProps } from '../types';
import { DashboardDataTable, DashboardEmptyInsight, DashboardSection, statusToneClass } from './DashboardSectionPrimitives';

export function LeadScoringSection({ leads, presentationMode }: LeadScoringSectionProps) {
  return (
    <DashboardSection id="leads" title="Pontuação de leads" subtitle="Classificação de potencial comercial calculada localmente com conversas, histórico e sinais de intenção." icon={Target} hidden={presentationMode}>
      {leads.length ? (
        <DashboardDataTable headers={['Cliente', 'Canal', 'Score', 'Classificação', 'Motivo', 'Última interação', 'Próxima ação']}>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-gray-900 dark:text-white">{lead.customerName}</td>
              <td className="px-3 py-2.5"><ChannelBadge channel={lead.channel} /></td>
              <td className="px-3 py-2.5"><div className="flex min-w-32 items-center gap-2"><div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-red-500" style={{ width: `${lead.score}%` }} /></div><span className="font-bold tabular-nums">{lead.score}</span></div></td>
              <td className="px-3 py-2.5"><span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold ring-1', statusToneClass(lead.label === 'Quente' || lead.label === 'Cliente fiel' ? 'green' : lead.label === 'Em risco' ? 'red' : lead.label === 'Morno' ? 'amber' : 'slate'))}>{lead.label}</span></td>
              <td className="min-w-52 px-3 py-2.5 text-gray-600 dark:text-gray-300">{lead.reason}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-gray-500">{formatRelativeTime(lead.lastInteraction)}</td>
              <td className="min-w-44 px-3 py-2.5 text-gray-700 dark:text-gray-300">{lead.nextAction}</td>
            </tr>
          ))}
        </DashboardDataTable>
      ) : (
        <DashboardEmptyInsight text="Sem leads suficientes para pontuação. Novas conversas e pedidos permitirão classificar clientes por potencial." />
      )}
    </DashboardSection>
  );
}
