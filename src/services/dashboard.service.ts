import { api } from './api';
import { USE_MOCK } from '@/config/runtime';
import { mockDashboard } from '@/data/mocks';
import { delay } from '@/utils';
import type { DashboardData } from '@/types';

export const dashboardService = {
  getDashboard: async (): Promise<DashboardData> => {
    if (USE_MOCK) {
      await delay(600);
      return mockDashboard;
    }
    const { data } = await api.get<DashboardData>('/dashboard');
    return data;
  },
};
