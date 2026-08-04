import { api } from './api';
import { USE_MOCK } from '@/config/runtime';
import { mockConversationAgentContext } from '@/data/mocks';
import { delay } from '@/utils';
import type { ConversationAgentContext } from '@/types';
import { isAxiosError } from 'axios';

const EMPTY_CONTEXT = (conversationId: string): ConversationAgentContext => ({
  conversationId,
  senderKey: null,
  contact: null,
  status: null,
  memories: [],
  pixPayments: [],
  recentResponses: [],
});

export const agentRuntimeService = {
  getConversationAgentContext: async (
    conversationId: string,
  ): Promise<ConversationAgentContext> => {
    if (USE_MOCK) {
      await delay(250);
      return mockConversationAgentContext[conversationId] ?? EMPTY_CONTEXT(conversationId);
    }

    try {
      const { data } = await api.get<ConversationAgentContext>(
        `/conversas/${conversationId}/agente`,
      );
      return {
        conversationId: data.conversationId ?? conversationId,
        senderKey: data.senderKey ?? null,
        contact: data.contact ?? null,
        status: data.status ?? null,
        memories: data.memories ?? [],
        pixPayments: data.pixPayments ?? [],
        recentResponses: data.recentResponses ?? [],
      };
    } catch (error) {
      // Endpoint ausente ou sem dados AI — painel degrada sem quebrar o atendimento.
      if (isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 501)) {
        return EMPTY_CONTEXT(conversationId);
      }
      throw error;
    }
  },
};
