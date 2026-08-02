import { api } from './api';
import { USE_MOCK } from '@/config/runtime';
import { mockMercosStatus, mockMercosLogs } from '@/data/mocks';
import { delay } from '@/utils';
import type { MercosHomologacao, MercosStatus, MercosLog } from '@/types';

export type MercosSyncType = 'products' | 'customers' | 'orders' | 'all';

export const mercosService = {
  getStatus: async (): Promise<MercosStatus> => {
    if (USE_MOCK) {
      await delay(400);
      return mockMercosStatus;
    }
    const { data } = await api.get<MercosStatus>('/mercos/status');
    return data;
  },

  getLogs: async (): Promise<MercosLog[]> => {
    if (USE_MOCK) {
      await delay(300);
      return mockMercosLogs;
    }
    const { data } = await api.get<MercosLog[]>('/mercos/logs');
    return data;
  },

  getHomologacao: async (): Promise<MercosHomologacao> => {
    if (USE_MOCK) {
      await delay(400);
      return {
        prontoParaHomologacao: false,
        erros: { mock: 'Modo mock ativo. Remova VITE_USE_MOCK=true para usar o backend real.' },
      };
    }
    const { data } = await api.get<MercosHomologacao>('/mercos/homologacao');
    return data;
  },

  sync: async (
    type: MercosSyncType,
    options?: { confirmProduction?: boolean },
  ): Promise<{ success: boolean; message: string }> => {
    if (USE_MOCK) {
      await delay(2000);
      const labels: Record<MercosSyncType, string> = {
        products: 'produtos',
        customers: 'clientes',
        orders: 'pedidos',
        all: 'todos os dados',
      };
      return { success: true, message: `Sincronização de ${labels[type]} concluída com sucesso` };
    }
    const { data } = await api.post('/mercos/sincronizar', {
      type,
      confirmProduction: options?.confirmProduction ?? false,
    });
    return data;
  },

  testConnection: async (): Promise<{ ok: boolean; message: string; clientes?: number }> => {
    if (USE_MOCK) {
      await delay(800);
      return { ok: false, message: 'Modo mock ativo. Remova VITE_USE_MOCK=true para usar o backend real.' };
    }
    const { data } = await api.post<{ ok: boolean; message: string; clientes?: number }>('/mercos/testar-conexao');
    return data;
  },
};
