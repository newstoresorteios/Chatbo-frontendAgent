import { api } from '@/services/api';
import type { OnboardingStep } from '@/features/onboarding/types';
import type { OnboardingStatus } from '@/utils/sessionScope';

export type MissingRequirement = keyof OnboardingRequirements;

export interface OnboardingRequirements {
  companyConfigured: boolean;
  operationConfigured: boolean;
  catalogAvailable: boolean;
  catalogScope: 'legacy_global' | 'workspace' | 'none';
  catalogProductCount?: number;
  channelConfigured: boolean;
  personaCreated: boolean;
  personaActive: boolean;
  testCompleted: boolean;
  readyForActivation: boolean;
}

export interface OnboardingState {
  status: OnboardingStatus;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  requirements: OnboardingRequirements;
  startedAt?: string;
  completedAt?: string;
}

export interface WorkspaceChannel {
  id: string;
  workspaceId: string;
  channelType: 'whatsapp' | 'webchat';
  status: 'draft' | 'configured' | 'active' | 'inactive';
  configuration: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface OnboardingTestResult {
  response: string;
  personaId: string;
  testCompleted: boolean;
  generatedAt?: string;
}

export interface OnboardingActivationResult extends OnboardingState {}

interface OnboardingResponse {
  status?: OnboardingStatus;
  completedSteps?: OnboardingStep[];
  startedAt?: string | null;
  completedAt?: string | null;
  currentStep?: OnboardingStep | null;
  requirements?: Partial<OnboardingRequirements>;
}

const defaultRequirements: OnboardingRequirements = {
  companyConfigured: false,
  operationConfigured: false,
  catalogAvailable: false,
  catalogScope: 'none',
  channelConfigured: false,
  personaCreated: false,
  personaActive: false,
  testCompleted: false,
  readyForActivation: false,
};

export const onboardingKeys = {
  current: (workspaceId: string) => ['onboarding', workspaceId] as const,
  channels: (workspaceId: string) => ['workspace-channels', workspaceId] as const,
};

function normalizeOnboarding(data: OnboardingResponse): OnboardingState {
  return {
    status: data.status ?? 'pending',
    currentStep: data.currentStep ?? 'empresa',
    completedSteps: data.completedSteps ?? [],
    requirements: { ...defaultRequirements, ...(data.requirements ?? {}) },
    startedAt: data.startedAt ?? undefined,
    completedAt: data.completedAt ?? undefined,
  };
}

export const onboardingService = {
  getCurrent: async (_workspaceId: string): Promise<OnboardingState> => {
    const { data } = await api.get<OnboardingResponse>('/onboarding');
    return normalizeOnboarding(data);
  },
  update: async (workspaceId: string, currentStep: OnboardingStep, status?: 'pending' | 'in_progress'): Promise<OnboardingState> => {
    void workspaceId;
    const { data } = await api.patch<OnboardingResponse>('/onboarding', { currentStep, status });
    return normalizeOnboarding(data);
  },
  listChannels: async (workspaceId: string): Promise<WorkspaceChannel[]> => {
    void workspaceId;
    const { data } = await api.get<WorkspaceChannel[]>('/workspace/channels');
    return data;
  },
  saveChannel: async (workspaceId: string, channelType: WorkspaceChannel['channelType']): Promise<WorkspaceChannel> => {
    void workspaceId;
    const { data } = await api.put<WorkspaceChannel>('/workspace/channels', { channelType, status: 'configured', configuration: {} });
    return data;
  },
  test: async (workspaceId: string, inputText: string): Promise<OnboardingTestResult> => {
    void workspaceId;
    const { data } = await api.post<OnboardingTestResult>('/onboarding/test', { inputText });
    return data;
  },
  activate: async (_workspaceId: string): Promise<OnboardingActivationResult> => {
    const { data } = await api.post<OnboardingResponse>('/onboarding/activate');
    return normalizeOnboarding(data);
  },
};
