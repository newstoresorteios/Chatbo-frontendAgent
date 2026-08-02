import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageState } from '@/components/ui/PageState';
import { billingService, billingStatusLabel } from '@/features/billing/service';

export function SubscriptionPage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['billing', 'overview'], queryFn: billingService.overview });
  const action = useMutation({ mutationFn: (kind: 'cancel' | 'reactivate') => kind === 'cancel' ? billingService.cancel() : billingService.reactivate(), onSuccess: () => client.invalidateQueries({ queryKey: ['billing'] }) });
  if (query.isLoading) return <PageState />;
  if (query.isError) return <PageState error="Não foi possível carregar sua assinatura." />;
  if (!query.data) return <PageState empty="Nenhum dado de assinatura disponível." />;
  const data = query.data;
  const subscription = data.subscription;
  return <div className="mx-auto max-w-5xl space-y-6"><div><p className="text-sm font-semibold uppercase tracking-widest text-primary-600">Gestão</p><h1 className="mt-2 text-3xl font-bold">Assinatura e faturamento</h1></div><Card title="Plano atual" icon={subscription ? CheckCircle2 : AlertCircle}>{subscription ? <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xl font-bold">{subscription.planName}</p><p className="text-sm text-gray-500">{billingStatusLabel[subscription.effectiveStatus] ?? subscription.effectiveStatus}</p></div>{subscription.cancelAtPeriodEnd && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Cancelamento agendado</span>}</div><div className="grid gap-3 text-sm sm:grid-cols-3"><div><p className="text-gray-500">Trial termina</p><p>{subscription.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString('pt-BR') : '—'}</p></div><div><p className="text-gray-500">Período atual</p><p>{subscription.currentPeriodEndsAt ? new Date(subscription.currentPeriodEndsAt).toLocaleDateString('pt-BR') : '—'}</p></div><div><p className="text-gray-500">Intervalo</p><p>{subscription.billingInterval === 'yearly' ? 'Anual' : 'Mensal'}</p></div></div><div className="flex gap-3">{subscription.cancelAtPeriodEnd ? <Button variant="secondary" loading={action.isPending} onClick={() => action.mutate('reactivate')}>Reativar</Button> : <Button variant="danger" loading={action.isPending} onClick={() => action.mutate('cancel')}>Cancelar ao fim do período</Button>}</div></div> : <p className="text-sm text-gray-500">Nenhum plano está atribuído a este workspace. Consulte os planos disponíveis para continuar.</p>}</Card><Card title="Uso do período"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(data.entitlements.limits).map(([metric, limit]) => { const used = data.entitlements.usage.values[metric] ?? 0; const unlimited = limit === null || limit === undefined; const percentage = unlimited ? 0 : Math.min(100, (used / Math.max(limit, 1)) * 100); return <div key={metric} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700"><div className="flex justify-between text-sm"><span>{metric}</span><span>{used} / {unlimited ? 'ilimitado' : limit}</span></div><div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-2 rounded-full bg-primary-600" style={{ width: `${percentage}%` }} /></div></div>; })}</div></Card></div>;
}
