import { formatCurrency } from '@/utils';
import { Gauge, GitBranch } from 'lucide-react';
import type { PipelineHealthSectionProps } from '../types';
import { formatPercent } from '../utils';
import { DashboardEmptyInsight, DashboardMiniMetric, DashboardSection } from './DashboardSectionPrimitives';

export function PipelineHealthSection({ data }: PipelineHealthSectionProps) {
  return (
    <DashboardSection id="pipeline" title="Saúde do pipeline" subtitle="Gargalos, valor em aberto e próximos riscos comerciais." icon={GitBranch}>
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-3xl border border-gray-200/80 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/90 lg:col-span-4">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Índice de saúde</p><p className="mt-2 font-display text-4xl font-black tabular-nums text-gray-950 dark:text-white">{data.health}</p></div>
            <Gauge className={data.tone === 'green' ? 'h-10 w-10 text-emerald-500' : data.tone === 'amber' ? 'h-10 w-10 text-amber-500' : 'h-10 w-10 text-red-500'} />
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-red-500" style={{ width: `${data.health}%` }} /></div>
          <p className="mt-4 text-sm text-gray-500">{data.bottleneck ? `Maior gargalo: ${data.bottleneck.label} (${formatPercent(data.bottleneck.quedaPct ?? 0)} de queda).` : 'Use pedidos, conversas e funil para detectar gargalos com mais precisão.'}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
          <DashboardMiniMetric label="Valor no funil" value={formatCurrency(data.openPipeline)} tone="blue" />
          <DashboardMiniMetric label="Oportunidades" value={data.opportunityCount} tone="slate" />
          <DashboardMiniMetric label="Conversão estimada" value={formatPercent(data.conversionRate)} tone="green" />
          <DashboardMiniMetric label="Negócios em risco" value={data.atRiskCount} tone={data.atRiskCount > 0 ? 'amber' : 'green'} />
        </div>
      </div>
      {data.stages.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.stages.map((stage) => (
            <div key={stage.id} className="rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90">
              <div className="flex items-center justify-between gap-3"><p className="font-semibold text-gray-900 dark:text-white">{stage.label}</p><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{formatPercent(stage.conversaoPct)}</span></div>
              <p className="mt-3 font-display text-2xl font-bold tabular-nums">{formatCurrency(stage.valor)}</p>
              <p className="mt-1 text-sm text-gray-500">{stage.quantidade} oportunidade(s)</p>
              <div className="mt-4 h-2 rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-red-500" style={{ width: `${Math.min(100, stage.conversaoPct)}%` }} /></div>
            </div>
          ))}
        </div>
      ) : (
        <DashboardEmptyInsight text="O ChatBô ainda não recebeu etapas suficientes do funil. A saúde do pipeline está usando pedidos, conversas e métricas comerciais disponíveis." />
      )}
    </DashboardSection>
  );
}
