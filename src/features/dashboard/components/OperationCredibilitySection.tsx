import { ShieldCheck } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { OperationCredibilitySectionProps } from '../types';
import { DashboardChartTooltip, DashboardMiniMetric, DashboardSection } from './DashboardSectionPrimitives';

const COLORS = ['#2563EB','#EF4444','#1D4ED8','#16A34A','#F59E0B','#64748B'];
export function OperationCredibilitySection({ data }: OperationCredibilitySectionProps) {
  return <DashboardSection id="credibilidade" title="Credibilidade e operação ChatBô" subtitle="Status dos dados, canais, IA e prontidão operacional." icon={ShieldCheck}>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{data.metrics.map((metric) => <DashboardMiniMetric key={metric.label} {...metric}/>)}</div>
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90"><h3 className="font-semibold text-gray-900 dark:text-white">Canais de conversão</h3>
        {data.channelVolume.length ? <div className="mt-4 flex items-center gap-4"><ResponsiveContainer width="42%" height={180}><PieChart><Pie data={data.channelVolume} cx="50%" cy="50%" innerRadius={42} outerRadius={66} paddingAngle={4} dataKey="value" strokeWidth={0}>{data.channelVolume.map((item,index) => <Cell key={item.type} fill={COLORS[index % COLORS.length]}/>)}</Pie><Tooltip content={<DashboardChartTooltip/>}/></PieChart></ResponsiveContainer>
          <div className="flex-1 space-y-2">{data.channelVolume.map((channel,index) => <div key={channel.type} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor:COLORS[index % COLORS.length]}}/>{channel.name}</span><strong>{channel.value}%</strong></div>)}</div>
        </div> : <p className="mt-4 text-sm text-gray-500">Sem mensagens registradas por canal.</p>}
      </div>
      <div className="rounded-3xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90"><h3 className="font-semibold text-gray-900 dark:text-white">Status geral do sistema</h3><div className="mt-4 space-y-3 text-sm">
        {[['Mercos',data.mercosStatus],['WhatsApp',data.whatsappStatus],['Supabase',data.supabaseStatus],['Dados sincronizados',data.synchronizedDataStatus]].map(([label,value]) => <p key={label} className="flex justify-between gap-4"><span className="text-gray-500">{label}</span><strong>{value}</strong></p>)}
      </div></div>
    </div>
  </DashboardSection>;
}
