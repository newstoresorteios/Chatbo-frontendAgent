import { cn } from '@/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface DashboardSectionProps {
  id: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  hidden?: boolean;
  presentationPriority?: 'primary' | 'secondary';
}

export function DashboardSection({
  id,
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  hidden,
}: DashboardSectionProps) {
  if (hidden) return null;

  return (
    <section id={id} className={cn('scroll-mt-32 space-y-4', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/50">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="font-display text-xl font-bold tracking-tight text-gray-950 dark:text-white">{title}</h2>
          </div>
          {description && <p className="mt-1 max-w-3xl text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyInsight({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 p-6 text-sm text-gray-500 dark:border-white/10 dark:bg-gray-900/60 dark:text-gray-400">
      {text}
    </div>
  );
}
