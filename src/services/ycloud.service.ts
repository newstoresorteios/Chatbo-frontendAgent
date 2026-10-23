import { api } from './api';
import { USE_MOCK } from '@/config/runtime';

export interface YCloudStatus {
  configured: boolean;
  connected: boolean;
  provider: 'ycloud';
  phone: string | null;
  canalId: string | null;
  providerStatus: string;
  webhookUrl: string | null;
}

export const ycloudService = {
  status: async (): Promise<YCloudStatus> => {
    if (USE_MOCK) return {
      configured: false, connected: false, provider: 'ycloud', phone: null,
      canalId: null, providerStatus: 'pending', webhookUrl: null,
    };
    const { data } = await api.get<YCloudStatus>('/ycloud/status');
    return data;
  },
  connect: async (name: string): Promise<void> => {
    if (USE_MOCK) throw new Error('Conexão real indisponível no modo demonstração');
    await api.post('/ycloud/conectar', { name });
  },
};
