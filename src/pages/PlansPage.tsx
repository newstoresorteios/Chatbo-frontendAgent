import { useQuery } from '@tanstack/react-query';
import { Check, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageState } from '@/components/ui/PageState';
import { Logo } from '@/components/layout/Logo';
import { billingService } from '@/features/billing/service';

function price(plan: { priceCents: number; pricingMode: string; currency: string; billingInterval: string }): string {
  if (plan.pricingMode === 'contact_sales') return 'Fale com nossa equipe';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: plan.currency }).format(plan.priceCents / 100) + ` / ${plan.billingInterval === 'yearly' ? 'ano' : 'mês'}`;
}

export function PlansPage() {
  const query = useQuery({ queryKey: ['billing', 'plans'], queryFn: billingService.listPlans });
  if (query.isLoading) return <PageState />;
  if (query.isError) return <PageState error="Não foi possível carregar os planos agora." />;
  const plans = query.data ?? [];
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-4"><Logo size="md" full className="max-w-[240px]" /><div><h1 className="text-3xl font-bold">Planos para sua operação</h1><p className="mt-2 text-gray-500">Escolha os recursos que sua equipe precisa. Pagamentos não são processados nesta etapa.</p></div></div>
      {plans.length === 0 ? <PageState empty="Nenhum plano público disponível." /> : <div className="grid gap-5 md:grid-cols-3">{plans.map((plan) => <Card key={plan.id} title={plan.name} subtitle={plan.description ?? undefined}><p className="text-2xl font-bold">{price(plan)}</p><p className="mt-2 text-sm text-gray-500">{plan.trialDays > 0 ? `${plan.trialDays} dias de teste` : 'Sem período de teste'}</p><div className="mt-5 space-y-2 text-sm">{Object.keys(plan.features ?? {}).filter((key) => plan.features?.[key]).map((feature) => <p key={feature} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" />{feature}</p>)}</div><Button className="mt-6 w-full" variant={plan.pricingMode === 'contact_sales' ? 'secondary' : 'primary'} onClick={() => { if (plan.pricingMode === 'contact_sales') window.location.href = 'mailto:contato@tironitech.com'; }}>{plan.pricingMode === 'contact_sales' ? <><MessageCircle className="h-4 w-4" /> Fale com nossa equipe</> : 'Selecionar plano'}</Button></Card>)}</div>}
    </div>
  );
}
