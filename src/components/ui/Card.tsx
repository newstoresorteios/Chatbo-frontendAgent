import { cn } from '@/utils';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function Card({ children, className, title, subtitle, icon: Icon, action }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90',
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div>
              {title && <h3 className="font-semibold text-gray-900 dark:text-slate-50">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500 dark:text-slate-300">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const statVariants = {
  default: 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
  success: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
};

export function StatCard({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <Card className="!p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {trend && <p className="mt-1 text-xs text-green-600 dark:text-green-400">{trend}</p>}
        </div>
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', statVariants[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
