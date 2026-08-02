import { cn } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  delta?: string;
  deltaUp?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'violet';
  delay?: number;
  sparkline?: number[];
}

const variants = {
  default: {
    icon: 'bg-slate-100 text-slate-600 ring-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700/60',
    glow: 'group-hover:shadow-slate-200/50 dark:group-hover:shadow-slate-900/50',
    bar: 'bg-slate-400',
    accent: 'from-slate-500/[0.07] via-transparent to-transparent',
    ring: 'ring-slate-100 dark:ring-slate-800',
  },
  primary: {
    icon: 'bg-blue-50 text-blue-600 ring-blue-200/60 dark:bg-blue-950/60 dark:text-blue-400 dark:ring-blue-800/60',
    glow: 'group-hover:shadow-blue-200/60 dark:group-hover:shadow-blue-900/40',
    bar: 'bg-blue-500',
    accent: 'from-blue-500/[0.12] via-blue-500/[0.03] to-transparent',
    ring: 'ring-blue-100/80 dark:ring-blue-900/40',
  },
  success: {
    icon: 'bg-emerald-50 text-emerald-600 ring-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-400 dark:ring-emerald-800/60',
    glow: 'group-hover:shadow-emerald-200/60 dark:group-hover:shadow-emerald-900/40',
    bar: 'bg-emerald-500',
    accent: 'from-emerald-500/[0.12] via-emerald-500/[0.03] to-transparent',
    ring: 'ring-emerald-100/80 dark:ring-emerald-900/40',
  },
  warning: {
    icon: 'bg-amber-50 text-amber-600 ring-amber-200/60 dark:bg-amber-950/60 dark:text-amber-400 dark:ring-amber-800/60',
    glow: 'group-hover:shadow-amber-200/60 dark:group-hover:shadow-amber-900/40',
    bar: 'bg-amber-500',
    accent: 'from-amber-500/[0.12] via-amber-500/[0.03] to-transparent',
    ring: 'ring-amber-100/80 dark:ring-amber-900/40',
  },
  violet: {
    icon: 'bg-red-50 text-red-600 ring-red-200/60 dark:bg-red-950/60 dark:text-red-400 dark:ring-red-800/60',
    glow: 'group-hover:shadow-red-200/60 dark:group-hover:shadow-red-900/40',
    bar: 'bg-red-500',
    accent: 'from-red-500/[0.10] via-red-500/[0.025] to-transparent',
    ring: 'ring-red-100/70 dark:ring-red-900/35',
  },
};

function MiniSparkline({ data, colorClass }: { data: number[]; colorClass: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-8 items-end gap-[3px]">
      {data.map((v, i) => (
        <div
          key={i}
          className={cn('w-1.5 rounded-full opacity-80 transition-all group-hover:opacity-100', colorClass)}
          style={{ height: `${Math.max(12, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function DashboardStatCard({
  title,
  value,
  icon: Icon,
  delta,
  deltaUp = true,
  variant = 'default',
  delay = 0,
  sparkline,
}: DashboardStatCardProps) {
  const v = variants[variant];
  const glowClass = v.glow;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-white/85 p-[18px] shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900/85 sm:p-5',
        v.ring,
        glowClass,
      )}
    >
      <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br', v.accent)} />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105',
              v.icon,
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </div>
          {sparkline && <MiniSparkline data={sparkline} colorClass={v.bar} />}
        </div>
        <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <p className="mt-1 font-display text-[1.8rem] font-black leading-none tracking-tight tabular-nums text-gray-950 dark:text-white sm:text-[2rem]">
          {value}
        </p>
        {delta && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 dark:bg-gray-800/80">
            {deltaUp ? (
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-500" />
            )}
            <span
              className={cn(
                'text-xs font-semibold',
                deltaUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500',
              )}
            >
              {delta}
            </span>
            <span className="text-[11px] text-gray-400">vs. semana</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface ChartPanelProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  delay?: number;
  accent?: 'teal' | 'violet' | 'amber' | 'none';
}

const panelAccents = {
  teal: 'before:bg-gradient-to-b before:from-blue-500 before:to-blue-600',
  violet: 'before:bg-gradient-to-b before:from-red-500 before:to-red-600',
  amber: 'before:bg-gradient-to-b before:from-amber-500 before:to-amber-600',
  none: '',
};

export function ChartPanel({
  title,
  subtitle,
  children,
  action,
  className,
  delay = 0,
  accent = 'teal',
}: ChartPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-gray-900/90 sm:p-6',
        accent !== 'none' && 'before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-l-2xl',
        accent !== 'none' && panelAccents[accent],
        className,
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-bold tracking-tight text-gray-950 dark:text-white">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

export function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white/95 px-4 py-3 shadow-2xl shadow-gray-900/10 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/95">
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-300">{entry.name}</span>
            </div>
            <span className="font-bold tabular-nums text-gray-900 dark:text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressRing({
  value,
  max,
  label,
  color = 'teal',
}: {
  value: number;
  max: number;
  label: string;
  color?: 'teal' | 'violet' | 'emerald';
}) {
  const pct = Math.min(100, (value / max) * 100);
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (pct / 100) * circumference;
  const colors = {
    teal: { stroke: '#2563eb', bg: 'text-blue-600 dark:text-blue-400' },
    violet: { stroke: '#ef4444', bg: 'text-red-600 dark:text-red-400' },
    emerald: { stroke: '#10b981', bg: 'text-emerald-600 dark:text-emerald-400' },
  };
  const c = colors[color];

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[72px] w-[72px]">
        <svg className="h-[72px] w-[72px] -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-100 dark:text-gray-800" />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={c.stroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-display text-base font-black', c.bg)}>{Math.round(pct)}%</span>
        </div>
      </div>
      <p className="mt-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

export function InsightBanner({
  icon: Icon,
  title,
  description,
  action,
  delay = 0,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-r from-blue-50 via-white to-red-50 p-4 shadow-sm dark:border-white/10 dark:from-blue-950/40 dark:via-gray-900 dark:to-red-950/25 sm:p-5"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-red-400/10 blur-2xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-red-500 text-white shadow-md shadow-blue-500/20">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display font-bold text-gray-950 dark:text-white">{title}</p>
            <p className="mt-0.5 max-w-xl text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
        {action}
      </div>
    </motion.div>
  );
}
