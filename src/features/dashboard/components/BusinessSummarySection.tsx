import { cn } from '@/utils';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import type { BusinessSummarySectionProps, DashboardTone, ExecutiveKpi } from '../types';

function statusToneClass(tone: DashboardTone): string {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/50',
    red: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/50',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/50',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/50',
    slate: 'bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:ring-slate-700',
  };
  return tones[tone];
}

function KpiCard({ item }: { item: ExecutiveKpi }) {
  const Icon = item.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="group rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-gray-900/90">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{item.title}</p>
          <p className="mt-3 font-display text-3xl font-black tabular-nums tracking-tight text-gray-950 dark:text-white">{item.value}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-red-500 text-white shadow-lg shadow-blue-600/20"><Icon className="h-5 w-5" /></div>
      </div>
      <p className="mt-3 min-h-10 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
      <span className={cn('mt-4 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1', statusToneClass(item.tone))}>{item.badge}</span>
    </motion.div>
  );
}

export function BusinessSummarySection({ metrics, presentationMode }: BusinessSummarySectionProps) {
  return (
    <section id="visao-geral" className="scroll-mt-32 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/50"><BarChart3 className="h-5 w-5" /></span>
            <h2 className="font-display text-xl font-bold tracking-tight text-gray-950 dark:text-white">Resumo geral do negócio</h2>
          </div>
          <p className="mt-1 max-w-3xl text-sm text-gray-500 dark:text-gray-400">KPIs executivos com contexto comercial e status operacional.</p>
        </div>
      </div>
      <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-5', presentationMode && 'xl:grid-cols-5')}>
        {metrics.map((item) => <KpiCard key={item.title} item={item} />)}
      </div>
    </section>
  );
}
