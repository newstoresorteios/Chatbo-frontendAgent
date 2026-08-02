import { api } from '@/services/api';
import type { AccountType, OnboardingStatus, WorkspaceRole } from '@/utils/sessionScope';

export interface WorkspaceSettings {
  segment?: string | null;
  website?: string | null;
  country?: string | null;
  currency?: string | null;
  salesModel?: 'b2b' | 'b2c' | 'mixed' | null;
  salesChannels: string[];
  businessHours?: string | null;
  primaryContact?: string | null;
  agentDisplayName?: string | null;
  agentRole?: string | null;
  agentLanguage?: string | null;
  agentPrimaryChannel?: string | null;
}

export interface CurrentWorkspace {
  id: string;
  name: string;
  brandName?: string | null;
  role: WorkspaceRole;
  status?: 'active' | 'inactive';
  accountType: AccountType;
  onboardingStatus: OnboardingStatus;
  settings?: WorkspaceSettings;
}

export const workspaceKeys = {
  current: () => ['workspace', 'current'] as const,
};

function normalizeWorkspace(value: CurrentWorkspace): CurrentWorkspace {
  return {
    ...value,
    role: value.role ?? 'member',
    accountType: value.accountType ?? 'workspace_user',
    onboardingStatus: value.onboardingStatus ?? 'complete',
    settings: value.settings
      ? { ...value.settings, salesChannels: value.settings.salesChannels ?? [] }
      : undefined,
  };
}

export const workspaceService = {
  current: async (): Promise<CurrentWorkspace> => {
    const { data } = await api.get<CurrentWorkspace>('/workspace/current');
    return normalizeWorkspace(data);
  },
};
