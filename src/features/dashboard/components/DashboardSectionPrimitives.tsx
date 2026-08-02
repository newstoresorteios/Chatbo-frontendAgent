import { cn } from '@/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DashboardTone } from '../types';

const TONE_CLASSES: Record<DashboardTone, string> = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/50',
  red: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/50',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/50',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/50',
  slate: 'bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:ring-slate-700',
};

export function statusToneClass(tone: DashboardTone): string {
  return TONE_CLASSES[tone];
}

export function DashboardEmptyInsight({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 p-6 text-sm text-gray-500 dark:border-white/10 dark:bg-gray-900/60 dark:text-gray-400">{text}</div>;
}

export function DashboardSection({ id, title, subtitle, icon: Icon, children, hidden }: { id: string; title: string; subtitle?: string; icon: LucideIcon; children: ReactNode; hidden?: boolean }) {
  if (hidden) return null;
  return (
    <section id={id} className="scroll-mt-32 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/50"><Icon className="h-5 w-5" /></span>
            <h2 className="font-display text-xl font-bold tracking-tight text-gray-950 dark:text-white">{title}</h2>
          </div>
          {subtitle && <p className="mt-1 max-w-3xl text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function DashboardMiniMetric({ label, value, tone = 'blue' }: { label: string; value: string | number; tone?: DashboardTone }) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-gray-900/80">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={cn('mt-2 font-display text-2xl font-bold tabular-nums', statusToneClass(tone).split(' ')[1])}>{value}</p>
    </div>
  );
}

export function DashboardChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs shadow-lg dark:border-white/10 dark:bg-gray-900">
      <p className="mb-2 font-semibold text-gray-900 dark:text-white">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="flex items-center justify-between gap-6 text-gray-500"><span>{item.name}</span><span className="font-semibold tabular-nums" style={{ color: item.color }}>{item.value}</span></p>
      ))}
    </div>
  );
}
export function DashboardDataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white/90 shadow-sm dark:border-white/10 dark:bg-gray-900/90">
      <table className="min-w-full text-left text-[13px] sm:text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-white/[0.03]">
          <tr>{headers.map((header) => <th key={header} className="whitespace-nowrap px-3 py-2.5 font-semibold">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/10">{children}</tbody>
      </table>
    </div>
  );
}
