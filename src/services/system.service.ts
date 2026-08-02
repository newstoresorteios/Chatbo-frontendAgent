import { api } from './api';
import type { SystemStatus } from '@/types';

export const systemService = {
  getStatus: async (): Promise<SystemStatus> => {
    const { data } = await api.get<SystemStatus>('/sistema/status');
    return data;
  },

  clearDemo: async (incluirMercos = false): Promise<{
    success: boolean;
    message: string;
    removed: Record<string, number>;
    before: Record<string, number>;
    after: Record<string, number>;
  }> => {
    const { data } = await api.post('/sistema/limpar-demo', { incluirMercos });
    return data;
  },
};
