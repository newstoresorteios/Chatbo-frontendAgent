import { formatCurrency } from '@/utils';
import { LineChart as LineChartIcon } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { RevenueForecastSectionProps } from '../types';
import { formatPercent } from '../utils';
import { DashboardChartTooltip, DashboardEmptyInsight, DashboardMiniMetric, DashboardSection } from './DashboardSectionPrimitives';

const FORECAST_COLORS = ['#16A34A', '#64748B', '#2563EB', '#EF4444'];

export function RevenueForecastSection({ data }: RevenueForecastSectionProps) {
  return (
      <DashboardSection id="previsao" title="Previsão comercial" subtitle="Estimativa calculada a partir dos dados disponíveis no ChatBô." icon={LineChartIcon}>
      {data.openPipeline > 0 ? (
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="rounded-3xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90 lg:col-span-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <DashboardMiniMetric label="Receita atual" value={formatCurrency(data.soldRevenue)} tone="green" />
              <DashboardMiniMetric label="Pipeline em aberto" value={formatCurrency(data.openPipeline)} tone="blue" />
              <DashboardMiniMetric label="Conservadora" value={formatCurrency(data.conservative)} tone="slate" />
              <DashboardMiniMetric label="Provável" value={formatCurrency(data.probable)} tone="blue" />
              <DashboardMiniMetric label="Otimista" value={formatCurrency(data.optimistic)} tone="green" />
              <DashboardMiniMetric label="Prob. conversão" value={formatPercent(data.probableRate * 100)} tone="amber" />
            </div>
            <p className="mt-4 text-xs text-gray-500">Estimativa calculada a partir dos dados disponíveis no ChatBô, combinando pipeline, retenção, conversão e fila comercial.</p>
          </div>
          <div className="rounded-3xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90 lg:col-span-3">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[{ name: 'Atual', valor: data.soldRevenue }, { name: 'Conservadora', valor: data.conservative }, { name: 'Provável', valor: data.probable }, { name: 'Otimista', valor: data.optimistic }]}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} className="stroke-gray-200 dark:stroke-gray-800" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip content={<DashboardChartTooltip />} />
                <Bar dataKey="valor" name="Valor" radius={[10, 10, 0, 0]}>{FORECAST_COLORS.map((color) => <Cell key={color} fill={color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <DashboardEmptyInsight text="Sem pipeline suficiente para estimativa. Sincronize pedidos, movimente oportunidades ou registre novas conversas para o ChatBô projetar cenários." />
      )}
    </DashboardSection>
  );
}
