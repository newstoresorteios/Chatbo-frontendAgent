import { api } from './api';
import type { SalesRankings } from '@/types';

export const rankingsService = {
  getRankings: async (limit = 10): Promise<SalesRankings> => {
    const { data } = await api.get<SalesRankings>('/vendas/rankings', {
      params: { limit },
    });
    return data;
  },
};
