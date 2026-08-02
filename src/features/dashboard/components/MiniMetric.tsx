import type { DashboardTone } from '@/features/dashboard/types';
import { statusToneClass } from '@/features/dashboard/utils/style';
import { cn } from '@/utils';

export function MiniMetric({
  label,
  value,
  tone = 'blue',
}: {
  label: string;
  value: string | number;
  tone?: DashboardTone;
}) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-gray-900/80">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={cn('mt-2 font-display text-2xl font-bold tabular-nums', statusToneClass(tone).split(' ')[1])}>{value}</p>
    </div>
  );
}
