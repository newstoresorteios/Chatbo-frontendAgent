import { cn } from '@/utils';

const variants = {
  default: 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-200',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  success: 'bg-green-100 text-green-700 dark:bg-emerald-950/50 dark:text-emerald-200',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200',
  danger: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-200',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
