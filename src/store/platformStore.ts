import {
  mockCampaigns,
  mockChannels,
  mockChatbots,
  mockFunnel,
  mockIntegrations,
} from '@/data/mocks';
import type { Campaign, Channel, ChatbotFlow, FunnelDeal, FunnelStage } from '@/types';

let channels = structuredClone(mockChannels);
let integrations = structuredClone(mockIntegrations);
let campaigns = structuredClone(mockCampaigns);
let chatbots = structuredClone(mockChatbots);
let funnel = structuredClone(mockFunnel);

export const platformStore = {
  getChannels: () => channels,
  connectChannel: (type: Channel['type'], name: string) => {
    const channel: Channel = {
      id: `ch-${Date.now()}`,
      type,
      name,
      connected: true,
      messagesToday: 0,
      lastActivity: new Date().toISOString(),
    };
    channels = [...channels, channel];
    return channel;
  },
  updateChannel: (id: string, patch: Partial<Channel>) => {
    channels = channels.map((c) => (c.id === id ? { ...c, ...patch } : c));
  },
  toggleChannel: (id: string) => {
    channels = channels.map((c) =>
      c.id === id ? { ...c, connected: !c.connected, lastActivity: new Date().toISOString() } : c,
    );
  },

  getIntegrations: () => integrations,
  toggleIntegration: (id: string) => {
    integrations = integrations.map((i) =>
      i.id === id ? { ...i, connected: !i.connected } : i,
    );
  },

  getCampaigns: () => campaigns,
  addCampaign: (campaign: Omit<Campaign, 'id' | 'sent' | 'opened'>) => {
    const item: Campaign = {
      ...campaign,
      id: `cp-${Date.now()}`,
      sent: 0,
      opened: 0,
    };
    campaigns = [item, ...campaigns];
    return item;
  },

  getChatbots: () => chatbots,
  addChatbot: (flow: Omit<ChatbotFlow, 'id' | 'triggers' | 'resolved'>) => {
    const item: ChatbotFlow = { ...flow, id: `bot-${Date.now()}`, triggers: 0, resolved: 0 };
    chatbots = [item, ...chatbots];
    return item;
  },
  toggleChatbot: (id: string) => {
    chatbots = chatbots.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
  },
  updateChatbot: (id: string, patch: Partial<ChatbotFlow>) => {
    chatbots = chatbots.map((b) => (b.id === id ? { ...b, ...patch } : b));
  },

  getFunnel: () => funnel,
  moveDeal: (dealId: string, targetStageId: string) => {
    let deal: FunnelDeal | undefined;
    funnel = funnel.map((stage) => {
      const found = stage.deals.find((d) => d.id === dealId);
      if (found) deal = found;
      return { ...stage, deals: stage.deals.filter((d) => d.id !== dealId) };
    });
    if (deal) {
      funnel = funnel.map((stage) =>
        stage.id === targetStageId
          ? { ...stage, deals: [...stage.deals, { ...deal!, stageId: targetStageId }] }
          : stage,
      );
    }
  },
};

export type { FunnelStage };
