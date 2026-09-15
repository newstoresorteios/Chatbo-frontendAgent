import { api } from './api';

export type AgentConfigurationValue = string | number;

export interface AgentConfigurationField {
  key: string;
  label: string;
  description: string;
  type: 'integer' | 'select';
  group: string;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string; label: string }>;
}

export interface AgentConfiguration {
  schemaVersion: number;
  version: number;
  values: Record<string, AgentConfigurationValue>;
  fields: AgentConfigurationField[];
  updatedAt?: string;
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
