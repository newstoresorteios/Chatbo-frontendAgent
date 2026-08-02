import { AlertTriangle, Brain, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import type { NitrosExecutiveSummaryProps } from '../types';
import { DashboardSection } from './DashboardSectionPrimitives';

export function NitrosExecutiveSummary({ diagnosis, recommendedAction, expectedImpact, mainRisk, mainOpportunity, agentOnline, connectedChannels }: NitrosExecutiveSummaryProps) {
  return (
    <DashboardSection id="ia" title="Resumo inteligente do ChatBô" subtitle="Diagnóstico acionável gerado a partir dos dados disponíveis no painel." icon={Brain}>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1220] via-blue-800 to-red-600 p-6 text-white shadow-xl shadow-blue-900/20 lg:col-span-2">
          <div className="flex items-center gap-2 text-blue-100"><Sparkles className="h-5 w-5" /><p className="text-xs font-bold uppercase tracking-[0.18em]">Coach comercial</p></div>
          <p className="mt-5 text-lg font-semibold leading-relaxed">{diagnosis}</p>
          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold uppercase tracking-wide text-blue-100">Ação recomendada agora</p><p className="mt-1 text-sm">{recommendedAction}</p></div>
            <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold uppercase tracking-wide text-blue-100">Impacto esperado</p><p className="mt-1 text-sm">{expectedImpact}</p></div>
          </div>
        </div>
        <div className="grid gap-4 lg:col-span-3 md:grid-cols-3">
          <div className="rounded-2xl border border-red-200/70 bg-red-50/80 p-5 dark:border-red-900/40 dark:bg-red-950/20"><AlertTriangle className="h-5 w-5 text-red-600" /><p className="mt-3 text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-300">Principal risco</p><p className="mt-2 text-sm text-gray-700 dark:text-gray-200">{mainRisk}</p></div>
          <div className="rounded-2xl border border-blue-200/70 bg-blue-50/80 p-5 dark:border-blue-900/40 dark:bg-blue-950/20"><Flame className="h-5 w-5 text-blue-600" /><p className="mt-3 text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">Principal oportunidade</p><p className="mt-2 text-sm text-gray-700 dark:text-gray-200">{mainOpportunity}</p></div>
          <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Credibilidade</p><p className="mt-2 text-sm text-gray-700 dark:text-gray-200">{agentOnline ? 'IA online' : 'IA sem status online'} com {connectedChannels} canal(is) conectado(s).</p></div>
        </div>
      </div>
    </DashboardSection>
  );
}
