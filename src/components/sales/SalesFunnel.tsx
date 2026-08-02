import { cn, formatCurrency } from '@/utils';
import type { SalesFunnelStep } from '@/types';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const FUNNEL_COLORS = ['#3483fa', '#2968c8', '#1f4f96', '#165a72', '#0d9488', '#059669', '#047857'];

export function SalesFunnel({ steps }: { steps: SalesFunnelStep[] }) {
  if (!steps.length) return null;

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const widthPct = Math.max(18, step.conversaoPct);
        const isRevenue = step.tipo === 'receita';
        const color = isRevenue ? '#047857' : FUNNEL_COLORS[index % FUNNEL_COLORS.length];
        const prevStep = index > 0 ? steps[index - 1] : null;
        const dropFromPrev =
          prevStep && prevStep.quantidade > step.quantidade
            ? Math.round((step.quantidade / prevStep.quantidade) * 100)
            : null;

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className="group"
          >
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {index + 1}
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{step.label}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-gray-500 dark:text-gray-400">
                <span>
                  <strong className="text-gray-900 dark:text-white">{step.quantidade}</strong> un.
                </span>
                <span>
                  {step.valor > 0 ? (
                    formatCurrency(step.valor)
                  ) : (
                    <span className="text-gray-400" title="Etapa sem valor monetário">
                      —
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-semibold',
                    isRevenue
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
                  )}
                >
                  {step.conversaoPct}% do topo
                </span>
                {dropFromPrev !== null && (
                  <span className="text-xs text-gray-400">↓ {dropFromPrev}% da etapa anterior</span>
                )}
              </div>
            </div>
            <div className="flex justify-center">
              <div
                className={cn(
                  'relative h-10 rounded-lg transition-all duration-500 group-hover:brightness-110',
                  isRevenue && 'ring-2 ring-emerald-400/50 ring-offset-2 dark:ring-offset-gray-900',
                )}
                style={{
                  width: `${widthPct}%`,
                  background: `linear-gradient(90deg, ${color}dd, ${color})`,
                  clipPath: index < steps.length - 1 ? 'polygon(0 0, 100% 0, 96% 100%, 4% 100%)' : undefined,
                }}
              >
                <div className="flex h-full items-center justify-center text-xs font-semibold text-white/90">
                  {step.conversaoPct}%
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex justify-center py-0.5 text-gray-300 dark:text-gray-600">
                <ArrowRight className="h-4 w-4 rotate-90" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
