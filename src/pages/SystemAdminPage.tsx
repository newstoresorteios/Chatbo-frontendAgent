import { useQuery } from '@tanstack/react-query';
import { Building2, CreditCard, Gauge, Layers3 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PageState } from '@/components/ui/PageState';
import { Logo } from '@/components/layout/Logo';
import { systemAdminService } from '@/services/systemAdmin.service';

export function SystemAdminPage() {
  const workspaces = useQuery({ queryKey: ['system', 'workspaces'], queryFn: systemAdminService.workspaces });
  const plans = useQuery({ queryKey: ['system', 'plans'], queryFn: systemAdminService.plans });
  const subscriptions = useQuery({ queryKey: ['system', 'subscriptions'], queryFn: systemAdminService.subscriptions });
  const usage = useQuery({ queryKey: ['system', 'usage'], queryFn: systemAdminService.usage });
  if ([workspaces, plans, subscriptions, usage].some((query) => query.isLoading)) return <PageState />;
  if ([workspaces, plans, subscriptions, usage].some((query) => query.isError)) return <PageState error="Não foi possível carregar a administração global." />;
  return <div className="mx-auto max-w-7xl space-y-6"><div className="space-y-4"><Logo size="md" full className="max-w-[240px]" /><div><h1 className="text-3xl font-bold">Administração global</h1><p className="mt-2 text-gray-500">Visão operacional de empresas, planos, assinaturas e uso. Ações de cobrança não são executadas aqui.</p></div></div><div className="grid gap-4 md:grid-cols-4"><Card title="Empresas" icon={Building2}><p className="text-3xl font-bold">{workspaces.data?.length ?? 0}</p></Card><Card title="Planos" icon={Layers3}><p className="text-3xl font-bold">{plans.data?.length ?? 0}</p></Card><Card title="Assinaturas" icon={CreditCard}><p className="text-3xl font-bold">{subscriptions.data?.length ?? 0}</p></Card><Card title="Registros de uso" icon={Gauge}><p className="text-3xl font-bold">{usage.data?.length ?? 0}</p></Card></div><Card title="Workspaces"><div className="space-y-2">{(workspaces.data ?? []).map((workspace) => <div key={workspace.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 p-3 text-sm dark:border-gray-700"><div><p className="font-semibold">{workspace.name}</p><p className="text-xs text-gray-500">{workspace.id}</p></div><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800">{workspace.status}</span></div>)}{workspaces.data?.length === 0 && <p className="text-sm text-gray-500">Nenhum workspace encontrado.</p>}</div></Card></div>;
}
