import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useSystemStatus } from '@/hooks/useQueries';
import { usePermissions } from '@/hooks/usePermissions';
import { canAccessSettingsTab } from '@/utils/navPermissions';
import type { SystemChecklistItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Circle, Rocket, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const DISMISS_KEY = 'pulsedesk_setup_dismissed';

function canActOnStep(tab: string, can: (p: string) => boolean, role: string) {
  return canAccessSettingsTab(tab, can, role);
}

function stepHref(item: SystemChecklistItem, can: (p: string) => boolean, role: string) {
  if (canActOnStep(item.settingsTab, can, role)) {
    return `/configuracoes?tab=${item.settingsTab}`;
  }
  return '/configuracoes';
}

export function SetupChecklist() {
  const { data, isLoading } = useSystemStatus();
  const { can, role } = usePermissions();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');

  const checklist = data?.checklist ?? [];
  const readiness = data?.readiness;
  const allDone = readiness ? readiness.completed >= readiness.total : false;

  const visible = useMemo(() => {
    if (dismissed || isLoading || !data) return false;
    return !allDone;
  }, [dismissed, isLoading, data, allDone]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  if (!visible || !readiness) return null;

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/90 via-white to-red-50/50 shadow-sm dark:border-blue-900/40 dark:from-blue-950/20 dark:via-gray-900 dark:to-red-950/10"
      >
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <Rocket className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Próximos passos para ir ao ar
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {readiness.completed} de {readiness.total} concluídos — configure integrações quando tiver os tokens do cliente.
              </p>
              <div className="mt-3 h-2 max-w-xs overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-red-500 transition-all"
                  style={{ width: `${readiness.percent}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={readiness.percent >= 50 ? 'warning' : 'default'}>{readiness.percent}%</Badge>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              aria-label="Ocultar checklist"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
          {checklist.map((item) => {
            const actionable = canActOnStep(item.settingsTab, can, role);
            return (
              <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-3 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  {item.done ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-gray-300 dark:text-gray-600" />
                  )}
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${item.done ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                      {item.title}
                      {item.optional ? (
                        <span className="ml-2 text-xs font-normal text-gray-400">(opcional)</span>
                      ) : null}
                    </p>
                    <p className="truncate text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
                {!item.done && (
                  actionable ? (
                    <Link
                      to={stepHref(item, can, role)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
                    >
                      Configurar
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <span className="shrink-0 text-xs text-gray-400">Admin</span>
                  )
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white/50 px-5 py-3 dark:border-gray-800 dark:bg-gray-900/30 sm:px-6">
          <Link
            to="/configuracoes?tab=sistema"
            className="text-sm font-medium text-blue-700 hover:underline dark:text-blue-300"
          >
            Ver status completo do sistema
          </Link>
          <Button variant="outline" size="sm" onClick={handleDismiss}>
            Lembrar depois
          </Button>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
