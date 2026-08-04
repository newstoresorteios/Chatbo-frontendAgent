import { api } from './api';

export interface SystemCompany {
  id: string;
  companyId: string;
  workspaceId: string;
  name: string;
  brandName?: string | null;
  status: string;
  membersCount: number;
  adminsCount: number;
  createdAt?: string;
  updatedAt?: string;
}

/** @deprecated use SystemCompany — workspaces === companies */
export type SystemWorkspace = SystemCompany;

export interface SystemCompanyMember {
  membershipId: string;
  userId: string;
  role: string;
  status: string;
  name: string;
  email: string;
  active: boolean;
  accountType: string;
  company?: string | null;
  createdAt?: string;
}

export interface CreateCompanyPayload {
  name: string;
  brandName?: string;
}

export interface CreateCompanyAdminPayload {
  name: string;
  email: string;
  password: string;
  role?: 'owner' | 'admin';
}

export interface UsageRow {
  workspace_id: string;
  metric: string;
  period_key: string;
  used_value: number;
}

export const systemAdminService = {
  companies: async (): Promise<SystemCompany[]> =>
    (await api.get<{ items: SystemCompany[] }>('/system/companies')).data.items,

  workspaces: async (): Promise<SystemCompany[]> =>
    (await api.get<{ items: SystemCompany[] }>('/system/workspaces')).data.items,

  createCompany: async (payload: CreateCompanyPayload): Promise<SystemCompany> =>
    (await api.post<SystemCompany>('/system/companies', payload)).data,

  updateCompany: async (
    companyId: string,
    payload: Partial<{ name: string; brandName: string; status: string }>,
  ): Promise<SystemCompany> =>
    (await api.patch<SystemCompany>(`/system/companies/${companyId}`, payload)).data,

  listMembers: async (companyId: string): Promise<SystemCompanyMember[]> =>
    (await api.get<{ items: SystemCompanyMember[] }>(`/system/companies/${companyId}/members`))
      .data.items,

  createAdmin: async (
    companyId: string,
    payload: CreateCompanyAdminPayload,
  ): Promise<SystemCompanyMember> =>
    (await api.post<SystemCompanyMember>(`/system/companies/${companyId}/admins`, payload)).data,

  plans: async () =>
    (await api.get<{ items: Record<string, unknown>[] }>('/system/billing/plans')).data.items,

  subscriptions: async () =>
    (await api.get<{ items: Record<string, unknown>[] }>('/system/billing/subscriptions')).data
      .items,

  usage: async (): Promise<UsageRow[]> =>
    (await api.get<{ items: UsageRow[] }>('/system/uso')).data.items,
};
