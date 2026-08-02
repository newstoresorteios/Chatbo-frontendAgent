import { api } from './api';
import { USE_MOCK } from '@/config/runtime';
import { platformStore } from '@/store/platformStore';
import { delay } from '@/utils';
import type { Channel, FunnelStage, Campaign, ChatbotFlow, Integration } from '@/types';

export const channelsService = {
  getChannels: async (): Promise<Channel[]> => {
    if (USE_MOCK) {
      await delay(400);
      return platformStore.getChannels();
    }
    const { data } = await api.get<Channel[]>('/canais');
    return data;
  },

  connect: async (type: Channel['type'], name: string) => {
    if (USE_MOCK) {
      await delay(800);
      return platformStore.connectChannel(type, name);
    }
    const { data } = await api.post<Channel>('/canais', { type, name });
    return data;
  },

  update: async (id: string, patch: Partial<Channel>) => {
    if (USE_MOCK) {
      await delay(500);
      platformStore.updateChannel(id, patch);
      return platformStore.getChannels().find((c) => c.id === id)!;
    }
    const { data } = await api.patch<Channel>(`/canais/${id}`, patch);
    return data;
  },

  toggle: async (id: string) => {
    if (USE_MOCK) {
      await delay(400);
      platformStore.toggleChannel(id);
    } else {
      await api.post(`/canais/${id}/toggle`);
    }
  },
};

export const funnelService = {
  getFunnel: async (): Promise<FunnelStage[]> => {
    if (USE_MOCK) {
      await delay(400);
      return platformStore.getFunnel();
    }
    const { data } = await api.get<FunnelStage[]>('/funil');
    return data;
  },

  moveDeal: async (dealId: string, stageId: string) => {
    if (USE_MOCK) {
      await delay(300);
      platformStore.moveDeal(dealId, stageId);
    } else {
      await api.post('/funil/mover', { dealId, stageId });
    }
  },

  syncFromMercos: async (): Promise<{
    success: boolean;
    dealsCreated: number;
    pipelineValor: number;
    message: string;
  }> => {
    const { data } = await api.post('/funil/sincronizar');
    return data;
  },
};

export const campaignsService = {
  getCampaigns: async (): Promise<Campaign[]> => {
    if (USE_MOCK) {
      await delay(400);
      return platformStore.getCampaigns();
    }
    const { data } = await api.get<Campaign[]>('/campanhas');
    return data;
  },

  create: async (campaign: Omit<Campaign, 'id' | 'sent' | 'opened' | 'failed'>) => {
    if (USE_MOCK) {
      await delay(600);
      return platformStore.addCampaign(campaign);
    }
    const { data } = await api.post<Campaign>('/campanhas', campaign);
    return data;
  },

  dispatch: async (id: string): Promise<{
    success: boolean;
    campaignId: string;
    recipients: number;
    sent: number;
    failed: number;
    status: string;
    message: string;
  }> => {
    const { data } = await api.post(`/campanhas/${id}/disparar`);
    return data;
  },
};

export const chatbotService = {
  getFlows: async (): Promise<ChatbotFlow[]> => {
    if (USE_MOCK) {
      await delay(400);
      return platformStore.getChatbots();
    }
    const { data } = await api.get<ChatbotFlow[]>('/chatbot/fluxos');
    return data;
  },

  create: async (flow: Omit<ChatbotFlow, 'id' | 'triggers' | 'resolved'>) => {
    if (USE_MOCK) {
      await delay(600);
      return platformStore.addChatbot(flow);
    }
    const { data } = await api.post<ChatbotFlow>('/chatbot/fluxos', flow);
    return data;
  },

  toggle: async (id: string) => {
    if (USE_MOCK) {
      await delay(300);
      platformStore.toggleChatbot(id);
    } else {
      await api.post(`/chatbot/fluxos/${id}/toggle`);
    }
  },

  update: async (id: string, patch: Partial<ChatbotFlow>) => {
    if (USE_MOCK) {
      await delay(400);
      platformStore.updateChatbot(id, patch);
    } else {
      await api.patch(`/chatbot/fluxos/${id}`, patch);
    }
  },

  test: async (
    id: string,
    payload?: { conversationId?: string; message?: string },
  ): Promise<{
    success: boolean;
    conversationId: string;
    reply?: string;
    source?: string;
    flowName?: string;
    message?: string;
  }> => {
    if (USE_MOCK) {
      await delay(600);
      return {
        success: true,
        conversationId: payload?.conversationId ?? 'conv-mock',
        reply: 'Olá! Sou o robô de atendimento. Como posso ajudar?',
        source: 'intelligent',
      };
    }
    const { data } = await api.post(`/chatbot/fluxos/${id}/testar`, payload ?? {});
    return data;
  },
};

export const integrationsService = {
  getIntegrations: async (): Promise<Integration[]> => {
    if (USE_MOCK) {
      await delay(400);
      return platformStore.getIntegrations();
    }
    const { data } = await api.get<Integration[]>('/integracoes');
    return data;
  },

  toggle: async (id: string) => {
    if (USE_MOCK) {
      await delay(500);
      platformStore.toggleIntegration(id);
    } else {
      await api.post(`/integracoes/${id}/toggle`);
    }
  },
};
