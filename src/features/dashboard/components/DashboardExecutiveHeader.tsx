import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';
import { Brain, Gauge, RefreshCw, Sparkles, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { DashboardExecutiveHeaderProps, DashboardTone } from '../types';
import { formatToday, getGreeting } from '../utils';

function statusToneClass(tone: DashboardTone): string {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/50',
    red: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/50',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/50',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/50',
    slate: 'bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:ring-slate-700',
  };
  return tones[tone];
}

export function DashboardExecutiveHeader({
  firstName,
  operationStatus,
  operationTone,
  presentationMode,
  isFetching,
  onRefresh,
  onTogglePresentation,
}: DashboardExecutiveHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1220] via-blue-800 to-red-600 p-6 text-white shadow-xl shadow-blue-900/25 lg:p-8"
    >
      <div className="pointer-events-none absolute inset-0 dashboard-grid-bg opacity-30" />
      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-100">
              <Sparkles className="h-3.5 w-3.5" /> Centro de inteligência comercial
            </span>
            <span className={cn('rounded-full px-3 py-1 text-xs font-semibold ring-1', statusToneClass(operationTone))}>
              Operação {operationStatus}
            </span>
            <span className="text-sm capitalize text-blue-100">{formatToday()}</span>
          </div>
          <h1 className="mt-5 font-display text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">Painel Comercial ChatBô</h1>
          <p className="mt-3 max-w-3xl text-base text-blue-50/90 lg:text-lg">Visão inteligente de vendas, clientes, produtos e oportunidades.</p>
          <p className="mt-2 text-sm text-blue-100/80">
            {getGreeting()}, {firstName}. O ChatBô consolida a rotina comercial, previsões e prioridades da operação em uma única tela.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/atendimento" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-blue-800 shadow-lg transition hover:bg-blue-50">
            <Target className="h-4 w-4" /> Abrir Central de Conversão
          </Link>
          <a href="#pergunte" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15">
            <Brain className="h-4 w-4" /> Perguntar ao ChatBô
          </a>
          <Button type="button" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/15" onClick={onRefresh} loading={isFetching}>
            <RefreshCw className="h-4 w-4" /> Atualizar
          </Button>
          <Button type="button" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/15" onClick={onTogglePresentation}>
            <Gauge className="h-4 w-4" /> {presentationMode ? 'Modo completo' : 'Modo apresentação'}
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
