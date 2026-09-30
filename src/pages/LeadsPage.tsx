import { CommercialLeadsPanel } from '@/features/dashboard/components/CommercialLeadsPanel';

export function LeadsPage() {
  return <div className="space-y-6">
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="absolute -right-12 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="relative"><div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-500"><span className="h-2 w-2 rounded-full bg-emerald-400" />Central de oportunidades</div><h1 className="font-display text-2xl font-bold text-slate-950 dark:text-white">Leads comerciais</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Priorize as oportunidades das últimas 24 horas, distribua para o comercial e abra a conversa com um clique. Após 24 horas o lead sai de quente; depois de sete dias, fica frio.</p></div>
    </div>
    <CommercialLeadsPanel />
  </div>;
}
