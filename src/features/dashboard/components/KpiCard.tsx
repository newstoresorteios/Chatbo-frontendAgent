import type { ExecutiveKpi } from '@/features/dashboard/types';
import { statusToneClass } from '@/features/dashboard/utils/style';
import { cn } from '@/utils';
import { motion } from 'framer-motion';

export function KpiCard({ item }: { item: ExecutiveKpi }) {
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-gray-900/90"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{item.title}</p>
          <p className="mt-3 font-display text-3xl font-black tabular-nums tracking-tight text-gray-950 dark:text-white">
            {item.value}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-red-500 text-white shadow-lg shadow-blue-600/20">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 min-h-10 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
      <span className={cn('mt-4 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1', statusToneClass(item.tone))}>
        {item.badge}
      </span>
    </motion.div>
  );
}
