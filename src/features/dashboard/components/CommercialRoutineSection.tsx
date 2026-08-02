import { cn } from '@/utils';
import { ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CommercialRoutineSectionProps } from '../types';
import { DashboardSection, statusToneClass } from './DashboardSectionPrimitives';

export function CommercialRoutineSection({ items, presentationMode }: CommercialRoutineSectionProps) {
  return (
    <DashboardSection id="rotina" title="Rotina comercial de hoje" subtitle="Lista dinâmica calculada na interface. Nenhuma tarefa é persistida no banco." icon={Calendar} hidden={presentationMode}>
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <div key={`${item.description}-${item.origin}`} className="rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90">
            <div className="flex items-start justify-between gap-3">
              <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold ring-1', statusToneClass(item.priority === 'Alta' ? 'red' : item.priority === 'Media' ? 'amber' : 'slate'))}>Prioridade {item.priority}</span>
              <span className="text-xs text-gray-500">{item.origin}</span>
            </div>
            <h3 className="mt-4 font-semibold text-gray-950 dark:text-white">{item.description}</h3>
            <p className="mt-2 text-sm text-gray-500">{item.impact}</p>
            {item.href ? (
              <Link to={item.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">{item.action} <ArrowRight className="h-4 w-4" /></Link>
            ) : (
              <a href="#pergunte" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">{item.action} <ArrowRight className="h-4 w-4" /></a>
            )}
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}
