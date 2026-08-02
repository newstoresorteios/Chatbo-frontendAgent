import { api } from '@/services/api';
import type { BillingOverview, Plan, Subscription } from './types';

export const billingService = {
  listPlans: async (): Promise<Plan[]> => (await api.get<{ items: Plan[] }>('/billing/plans')).data.items,
  subscription: async (): Promise<Subscription | { subscription: null; subscriptionState: 'legacy_unassigned' }> => (await api.get('/billing/subscription')).data,
  overview: async (): Promise<BillingOverview> => (await api.get<BillingOverview>('/billing/overview')).data,
  selectPlan: async (planCode: string, billingInterval: 'monthly' | 'yearly'): Promise<Subscription> => (await api.post<Subscription>('/billing/select-plan', { planCode, billingInterval })).data,
  cancel: async (): Promise<Subscription> => (await api.post<Subscription>('/billing/cancel')).data,
  reactivate: async (): Promise<Subscription> => (await api.post<Subscription>('/billing/reactivate')).data,
};

export const billingStatusLabel: Record<string, string> = {
  trialing: 'Período de teste',
  active: 'Ativa',
  past_due: 'Pagamento pendente',
  suspended: 'Suspensa',
  canceled: 'Cancelada',
  expired: 'Expirada',
  legacy_unassigned: 'Plano não atribuído',
};
