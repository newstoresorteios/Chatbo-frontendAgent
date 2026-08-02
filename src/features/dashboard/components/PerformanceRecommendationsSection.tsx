import { cn } from '@/utils';
import { ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PerformanceRecommendationsSectionProps } from '../types';
import { DashboardEmptyInsight, DashboardSection, statusToneClass } from './DashboardSectionPrimitives';

export function PerformanceRecommendationsSection({ recommendations }: PerformanceRecommendationsSectionProps) {
  return <DashboardSection id="recomendacoes" title="Recomendações para melhorar performance" subtitle="Próximas ações sugeridas pelo painel a partir da operação atual." icon={Zap}>
    {recommendations.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{recommendations.map((item) => <div key={item.title} className="rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90">
      <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold ring-1', statusToneClass(item.priority === 'Alta' ? 'red' : item.priority === 'Media' ? 'amber' : 'slate'))}>Prioridade {item.priority}</span>
      <h3 className="mt-4 font-semibold text-gray-950 dark:text-white">{item.title}</h3><p className="mt-2 text-sm text-gray-500">{item.reason}</p><p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{item.impact}</p>
      {item.href ? <Link to={item.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">{item.action} <ArrowRight className="h-4 w-4"/></Link> : <a href="#pergunte" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">{item.action} <ArrowRight className="h-4 w-4"/></a>}
    </div>)}</div> : <DashboardEmptyInsight text="Nenhuma recomendação disponível com os dados atuais."/>}
  </DashboardSection>;
}
