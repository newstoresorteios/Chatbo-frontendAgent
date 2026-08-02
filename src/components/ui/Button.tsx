import { cn } from '@/utils';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

const variants = {
  primary: 'bg-primary-600 text-white shadow-sm shadow-blue-600/15 hover:bg-primary-500 active:bg-primary-700',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
  outline: 'border border-gray-300 bg-transparent hover:border-primary-400 hover:bg-primary-50 dark:border-slate-500/70 dark:text-slate-100 dark:hover:border-cyan-300/70 dark:hover:bg-cyan-400/10',
  ghost: 'bg-transparent hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizes = {
  sm: 'min-h-8 px-3 py-1.5 text-sm',
  md: 'min-h-10 px-4 py-2 text-sm',
  lg: 'min-h-11 px-5 py-2.5 text-base',
  icon: 'h-10 w-10 p-0',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-slate-950',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
