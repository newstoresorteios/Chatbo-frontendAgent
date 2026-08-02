import { formatCurrency } from '@/utils';
import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CommercialPerformanceSectionProps } from '../types';
import { formatPercent } from '../utils';
import { DashboardChartTooltip, DashboardMiniMetric, DashboardSection } from './DashboardSectionPrimitives';

const BLUE = '#2563EB';
export function CommercialPerformanceSection({ data }: CommercialPerformanceSectionProps) {
  return <DashboardSection id="desempenho" title="Desempenho comercial" subtitle="Evolução no período selecionado e indicadores de venda." icon={TrendingUp}>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardMiniMetric label="Ticket médio" value={formatCurrency(data.ticketAverage)} tone="blue" /><DashboardMiniMetric label="Quantidade de pedidos" value={data.orderCount} tone="slate" />
      <DashboardMiniMetric label="Valor total vendido" value={formatCurrency(data.soldRevenue)} tone="green" /><DashboardMiniMetric label="Receita retida" value={formatCurrency(data.retainedRevenue)} tone="green" />
      <DashboardMiniMetric label="Clientes ativos" value={data.activeCustomers} tone="blue" /><DashboardMiniMetric label="Clientes recorrentes" value={data.recurringCustomers} tone="green" />
      <DashboardMiniMetric label="Conversão estimada" value={formatPercent(data.conversionRate)} tone="amber" /><DashboardMiniMetric label="Evolução" value={data.evolutionPoints ? `${data.evolutionPoints} pontos` : 'Sem série'} tone="slate" />
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90"><h3 className="font-semibold text-gray-900 dark:text-white">Vendas e conversas</h3><ResponsiveContainer width="100%" height={280}><AreaChart data={data.conversationsChart}><defs><linearGradient id="dashConversations" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={BLUE} stopOpacity={0.35}/><stop offset="100%" stopColor={BLUE} stopOpacity={0}/></linearGradient><linearGradient id="dashCustomers" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EF4444" stopOpacity={0.25}/><stop offset="100%" stopColor="#EF4444" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="4 4" vertical={false} className="stroke-gray-200 dark:stroke-gray-800"/><XAxis dataKey="name" tick={{fontSize:12,fill:'#6B7280'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:12,fill:'#6B7280'}} axisLine={false} tickLine={false}/><Tooltip content={<DashboardChartTooltip/>}/><Area type="monotone" dataKey="conversas" name="Conversas" stroke={BLUE} fill="url(#dashConversations)" strokeWidth={3}/><Area type="monotone" dataKey="clientes" name="Clientes" stroke="#EF4444" fill="url(#dashCustomers)" strokeWidth={3}/></AreaChart></ResponsiveContainer></div>
      <div className="rounded-3xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90"><h3 className="font-semibold text-gray-900 dark:text-white">Pedidos e velocidade</h3><ResponsiveContainer width="100%" height={280}><LineChart data={data.responseTimeChart}><CartesianGrid strokeDasharray="4 4" vertical={false} className="stroke-gray-200 dark:stroke-gray-800"/><XAxis dataKey="name" tick={{fontSize:12,fill:'#6B7280'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:12,fill:'#6B7280'}} axisLine={false} tickLine={false}/><Tooltip content={<DashboardChartTooltip/>}/><Line type="monotone" dataKey="conversas" name="Tempo (min)" stroke={BLUE} strokeWidth={3} dot={{r:4}}/></LineChart></ResponsiveContainer></div>
    </div>
  </DashboardSection>;
}
