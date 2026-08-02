import { api } from './api';
import { USE_MOCK } from '@/config/runtime';
import { mockConversations, mockMessages } from '@/data/mocks';
import { delay } from '@/utils';
import type { Conversation, Message } from '@/types';

let messagesStore = { ...mockMessages };

export const conversationsService = {
  getConversations: async (): Promise<Conversation[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockConversations;
    }
    const { data } = await api.get<Conversation[]>('/conversas');
    return data;
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    if (USE_MOCK) {
      await delay(300);
      return messagesStore[conversationId] ?? [];
    }
    const { data } = await api.get<Message[]>(
      `/conversas/${conversationId}/mensagens`,
    );
    return data;
  },

  sendMessage: async (
    conversationId: string,
    content: string,
    sender: 'agent' | 'ai' = 'agent',
  ): Promise<Message> => {
    if (USE_MOCK) {
      await delay(200);
      const message: Message = {
        id: `m-${Date.now()}`,
        conversationId,
        content,
        sender,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };
      messagesStore = {
        ...messagesStore,
        [conversationId]: [...(messagesStore[conversationId] ?? []), message],
      };
      return message;
    }
    const { data } = await api.post<Message>(
      `/conversas/${conversationId}/mensagens`,
      { content, sender },
    );
    return data;
  },

  transfer: async (conversationId: string, assigneeId: string): Promise<Conversation> => {
    if (USE_MOCK) {
      await delay(200);
      const conv = mockConversations.find((c) => c.id === conversationId);
      if (!conv) throw new Error('Conversa não encontrada');
      return { ...conv, assignedTo: assigneeId, status: 'active' };
    }
    const { data } = await api.patch<Conversation>(
      `/conversas/${conversationId}/transferir`,
      { assigneeId },
    );
    return data;
  },

  assume: async (conversationId: string): Promise<Conversation> => {
    if (USE_MOCK) {
      await delay(200);
      const conv = mockConversations.find((c) => c.id === conversationId);
      if (!conv) throw new Error('Conversa não encontrada');
      return { ...conv, status: 'active' };
    }
    const { data } = await api.patch<Conversation>(
      `/conversas/${conversationId}/assumir`,
    );
    return data;
  },

  close: async (conversationId: string, note?: string): Promise<Conversation> => {
    if (USE_MOCK) {
      await delay(200);
      const conv = mockConversations.find((c) => c.id === conversationId);
      if (!conv) throw new Error('Conversa não encontrada');
      return { ...conv, status: 'closed' };
    }
    const { data } = await api.patch<Conversation>(
      `/conversas/${conversationId}/encerrar`,
      note ? { note } : {},
    );
    return data;
  },

  reopen: async (conversationId: string): Promise<Conversation> => {
    if (USE_MOCK) {
      await delay(200);
      const conv = mockConversations.find((c) => c.id === conversationId);
      if (!conv) throw new Error('Conversa não encontrada');
      return { ...conv, status: 'active' };
    }
    const { data } = await api.patch<Conversation>(
      `/conversas/${conversationId}/reativar`,
    );
    return data;
  },

  reserveProduct: async (
    conversationId: string,
    payload: { productId: string; productName?: string; quantity?: number },
  ): Promise<Conversation> => {
    if (USE_MOCK) {
      await delay(200);
      const conv = mockConversations.find((c) => c.id === conversationId);
      if (!conv) throw new Error('Conversa não encontrada');
      return conv;
    }
    const { data } = await api.post<Conversation>(
      `/conversas/${conversationId}/reserva`,
      payload,
    );
    return data;
  },
};
