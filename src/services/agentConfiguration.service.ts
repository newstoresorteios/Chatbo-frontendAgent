import { api } from './api';

export type AgentConfigurationValue = string | number | boolean;

export interface AgentConfigurationField {
  key: string;
  label: string;
  description: string;
  type: 'integer' | 'number' | 'select' | 'boolean' | 'text' | 'textarea';
  group: string;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string; label: string }>;
  readOnly?: boolean;
  default?: AgentConfigurationValue;
  maxLength?: number;
  variables?: string[];
  valueSchema?: string;
  target?: 'setting' | 'runtime' | 'policy' | 'message' | 'knowledge';
}

export interface AgentConfiguration {
  schemaVersion: number;
  version: number;
  values: Record<string, AgentConfigurationValue>;
  fields: AgentConfigurationField[];
  updatedAt?: string;
  diagnostics?: Array<{ code: string; level: 'info' | 'error'; message: string }>;
}

export interface AgentConfigurationVersion {
  id: string;
  version: number;
  schemaVersion: number;
  values: Record<string, AgentConfigurationValue>;
  createdBy?: string;
  createdAt?: string;
}

export const agentConfigurationService = {
  get: async (): Promise<AgentConfiguration> => {
    const { data } = await api.get<AgentConfiguration>('/agents/current/configuration');
    return data;
  },

  publish: async (
    expectedVersion: number,
    values: Record<string, AgentConfigurationValue>,
  ): Promise<AgentConfiguration> => {
    const { data } = await api.put<AgentConfiguration>('/agents/current/configuration', {
      expectedVersion,
      values,
    });
    return data;
  },

  history: async (): Promise<AgentConfigurationVersion[]> => {
    const { data } = await api.get<AgentConfigurationVersion[]>(
      '/agents/current/configuration/history',
    );
    return data;
  },
};
