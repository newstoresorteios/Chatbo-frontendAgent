import { Headphones } from 'lucide-react';
import type { ServiceCapacitySectionProps } from '../types';
import { DashboardMiniMetric, DashboardSection } from './DashboardSectionPrimitives';

export function ServiceCapacitySection({ data }: ServiceCapacitySectionProps) {
  return (
    <DashboardSection id="operacao" title="Capacidade de atendimento" subtitle="Carga operacional, velocidade e resolução por IA." icon={Headphones}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <DashboardMiniMetric label="Ativas" value={data.activeConversations} tone="blue" />
        <DashboardMiniMetric label="Aguardando" value={data.waitingConversations} tone={data.waitingConversations ? 'amber' : 'green'} />
        <DashboardMiniMetric label="Encerradas" value={data.closedConversations} tone="slate" />
        <DashboardMiniMetric label="Tempo médio" value={data.averageResponseTime} tone="blue" />
        <DashboardMiniMetric label="Resolvido por IA" value={`${data.aiResolutionRate}%`} tone="green" />
        <DashboardMiniMetric label="Carga estimada" value={data.status} tone={data.tone} />
      </div>
      <div className="rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {data.status === 'Saudável' ? 'Operação saudável no momento.' : data.status === 'Atenção' ? 'Use o Assistente ChatBô para acelerar respostas e priorize leads quentes.' : 'Fila alta. Priorize leads quentes e distribua atendimento antes de iniciar novas campanhas.'}
        </p>
      </div>
    </DashboardSection>
  );
}
