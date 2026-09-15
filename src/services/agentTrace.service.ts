import { api } from './api';

export type AgentTraceOutcome = 'delivered' | 'fallback' | 'handoff' | 'failed';

export interface AgentTraceSummary {
  id: number;
  traceId: string;
  inboundId?: number;
  channel: string;
  outcome: AgentTraceOutcome;
  intent?: string;
  executionPath: string;
  durationMs: number;
  openAiCalls: number;
  trayCalls: number;
  databaseCalls: number;
  inputTokens: number;
  outputTokens: number;
  inputPreview?: string;
  outputPreview?: string;
  fallbackReasons: string[];
  safetyReason?: string;
  personaVersionId?: number;
  configurationKeys: string[];
  configurationVersion?: number;
  configurationCount?: number;
  createdAt: string;
  responseSource?: string;
}

export interface AgentTraceDetail extends AgentTraceSummary {
  stages: Record<string, number>;
  llmCalls: Array<Record<string, unknown>>;
  llmCallsByType: Record<string, number>;
  trayTools: Array<{ tool?: string; ok?: boolean; elapsed_ms?: number }>;
  catalogQueries: Array<{ source: string; strategy: string; status: string; filters: Record<string, unknown>; result_count: number | null; duration_ms: number }>;
  integrationFailures: Record<string, number>;
  inbound: Record<string, unknown>;
  context: Record<string, unknown>;
  outbound: Record<string, unknown>;
  qualityJudge: Record<string, unknown>;
  factualValidation: Record<string, unknown>;
  personaRuntime: Record<string, unknown>;
}

export interface AgentTracePage {
  items: AgentTraceSummary[];
  hasNext: boolean;
  nextCursor?: string;
}

export const agentTraceService = {
  list: async (filters?: { channel?: string; outcome?: string; before?: string }): Promise<AgentTracePage> => {
    const { data } = await api.get<AgentTracePage>('/agents/current/traces', {
      params: { limit: 60, ...filters },
    });
    return data;
  },

  get: async (id: number): Promise<AgentTraceDetail> => {
    const { data } = await api.get<AgentTraceDetail>(`/agents/current/traces/${id}`);
    return data;
  },
};
