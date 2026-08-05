import { api } from './api';
import type { CommercialBiSnapshot } from '@/types';

export const commercialBiService = {
  latest: async (): Promise<CommercialBiSnapshot | null> => {
    const { data } = await api.get<{ item: CommercialBiSnapshot | null }>('/commercial-bi/latest');
    return data.item ?? null;
  },
  analyze: async (periodDays = 30): Promise<CommercialBiSnapshot> => {
    const { data } = await api.post<CommercialBiSnapshot>('/commercial-bi/analyze', { periodDays });
    return data;
  },
};
