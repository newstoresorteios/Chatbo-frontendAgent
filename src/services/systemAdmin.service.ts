import { api } from './api';

export interface SystemWorkspace { id: string; name: string; status: string; brand_name?: string | null; created_at?: string; }
export interface UsageRow { workspace_id: string; metric: string; period_key: string; used_value: number; }

export const systemAdminService = {
  workspaces: async (): Promise<SystemWorkspace[]> => (await api.get<{ items: SystemWorkspace[] }>('/system/workspaces')).data.items,
  plans: async () => (await api.get<{ items: Record<string, unknown>[] }>('/system/billing/plans')).data.items,
  subscriptions: async () => (await api.get<{ items: Record<string, unknown>[] }>('/system/billing/subscriptions')).data.items,
  usage: async (): Promise<UsageRow[]> => (await api.get<{ items: UsageRow[] }>('/system/uso')).data.items,
};
