import type { DashboardTone } from '@/features/dashboard/types';

export function statusToneClass(tone: DashboardTone): string {
  const tones: Record<DashboardTone, string> = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/50',
    red: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/50',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/50',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/50',
    slate: 'bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:ring-slate-700',
  };
  return tones[tone];
}

export function toneForPriority(priority: 'Alta' | 'Media' | 'Baixa'): DashboardTone {
  if (priority === 'Alta') return 'red';
  if (priority === 'Media') return 'amber';
  return 'slate';
}
