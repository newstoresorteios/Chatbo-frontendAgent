import { useNotification } from '@/contexts/NotificationContext';
import { cn } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
};

const styles = {
  info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30',
  success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30',
  warning: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/30',
  error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30',
};

const iconStyles = {
  info: 'text-blue-600 dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-amber-600 dark:text-amber-400',
  error: 'text-red-600 dark:text-red-400',
};

export function ToastContainer() {
  const { toasts, removeToast } = useNotification();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className={cn(
                'flex min-w-[300px] items-start gap-3 rounded-lg border p-4 shadow-lg',
                styles[toast.type],
              )}
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconStyles[toast.type])} />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-slate-50">{toast.title}</p>
                {toast.message && (
                  <p className="mt-0.5 text-sm text-gray-600 dark:text-slate-300">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 dark:text-slate-300 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
