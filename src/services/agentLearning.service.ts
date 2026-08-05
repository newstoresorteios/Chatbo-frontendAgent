import { api } from '@/services/api';

export type LearningInsightStatus =
  | 'pending_review'
  | 'applied'
  | 'rejected'
  | 'superseded'
  | 'expired';

export type LearningExtensionStatus =
  | 'pending_review'
  | 'active'
  | 'rejected'
  | 'superseded'
  | 'expired';

export interface LearningInsight {
  id: number;
  tenantId: string;
  insightKey?: string;
  category: string;
  title: string;
  insightText: string;
  evidenceCount: number;
  confidence: number;
  importance: number;
  status: LearningInsightStatus;
  appliedExtensionId?: number | null;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string | null;
}

export interface LearningExtension {
  id: number;
  tenantId: string;
  workspaceId?: string | null;
  extensionKey: string;
  category: string;
  instructionText: string;
  source?: string;
  status: LearningExtensionStatus;
  importance?: number | null;
  confidence?: number | null;
  metadata?: Record<string, unknown>;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningOverview {
  tenantId: string;
  pendingInsights: LearningInsight[];
  pendingExtensions: LearningExtension[];
  activeExtensions: LearningExtension[];
  counts: {
    pendingInsights: number;
    pendingExtensions: number;
    activeExtensions: number;
  };
}

export const agentLearningKeys = {
  all: ['agent-learning'] as const,
  overview: () => [...agentLearningKeys.all, 'overview'] as const,
};

export const agentLearningService = {
  overview: async (): Promise<LearningOverview> => {
    const { data } = await api.get<LearningOverview>('/agent-learning/overview');
    return data;
  },

  promoteInsight: async (insightId: number, activate = true) => {
    const { data } = await api.post<{
      insight: LearningInsight;
      extension: LearningExtension | null;
      activated: boolean;
    }>(`/agent-learning/insights/${insightId}/promote`, { activate });
    return data;
  },

  rejectInsight: async (insightId: number, reason?: string) => {
    const { data } = await api.post<{ insight: LearningInsight }>(
      `/agent-learning/insights/${insightId}/reject`,
      { reason: reason || null },
    );
    return data;
  },

  approveExtension: async (extensionId: number) => {
    const { data } = await api.post<{ extension: LearningExtension; activated: boolean }>(
      `/agent-learning/extensions/${extensionId}/approve`,
    );
    return data;
  },

  rejectExtension: async (extensionId: number, reason?: string) => {
    const { data } = await api.post<{ extension: LearningExtension }>(
      `/agent-learning/extensions/${extensionId}/reject`,
      { reason: reason || null },
    );
    return data;
  },
};
