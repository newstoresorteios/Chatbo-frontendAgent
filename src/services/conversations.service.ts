import { api } from './api';
import { USE_MOCK } from '@/config/runtime';
import { mockConversations, mockMessages } from '@/data/mocks';
import { delay } from '@/utils';
import type { ChannelType, Conversation, ConversationStatus, Message, MessageSender } from '@/types';

let messagesStore = { ...mockMessages };

const CHANNELS: ChannelType[] = [
  'whatsapp',
  'instagram',
  'facebook',
  'telegram',
  'webchat',
  'sms',
  'email',
];

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== 'object') return [];
  const record = data as Record<string, unknown>;
  for (const key of ['items', 'data', 'conversations', 'mensagens', 'messages']) {
    if (Array.isArray(record[key])) return record[key] as T[];
  }
  return [];
}

function asChannel(value: unknown): ChannelType {
  const channel = String(value || 'whatsapp').toLowerCase();
  return (CHANNELS as string[]).includes(channel) ? (channel as ChannelType) : 'whatsapp';
}

function asStatus(value: unknown): ConversationStatus {
  const status = String(value || 'active').toLowerCase();
  if (status === 'waiting' || status === 'closed' || status === 'active') return status;
  return 'active';
}

function asSender(value: unknown): MessageSender {
  const sender = String(value || 'agent').toLowerCase();
  if (sender === 'customer' || sender === 'agent' || sender === 'ai') return sender;
  return 'agent';
}

function normalizeConversation(raw: Partial<Conversation> & Record<string, unknown>): Conversation {
  return {
    id: String(raw.id ?? ''),
    customerId: String(raw.customerId ?? ''),
    customerName: String(raw.customerName || 'Cliente'),
    customerAvatar: raw.customerAvatar,
    lastMessage: String(raw.lastMessage ?? ''),
    lastMessageAt: String(raw.lastMessageAt || new Date().toISOString()),
    status: asStatus(raw.status),
    unreadCount: Number(raw.unreadCount || 0),
    channel: asChannel(raw.channel),
    department: raw.department ? String(raw.department) : undefined,
    protocol: raw.protocol ? String(raw.protocol) : undefined,
    assignedTo: raw.assignedTo ? String(raw.assignedTo) : undefined,
    assignedName: raw.assignedName ? String(raw.assignedName) : undefined,
    canalId: (raw.canalId as string | null | undefined) ?? null,
    contactPhone: (raw.contactPhone as string | null | undefined) ?? null,
  };
}

function normalizeMessage(raw: Partial<Message> & Record<string, unknown>): Message {
  const externalId = raw.externalId ?? raw['external_id'];
  return {
    id: String(raw.id ?? ''),
    conversationId: String(raw.conversationId ?? ''),
    content: String(raw.content ?? ''),
    sender: asSender(raw.sender),
    timestamp: String(raw.timestamp || new Date().toISOString()),
    status: (raw.status as Message['status']) || 'sent',
    aiSource: raw.aiSource,
    externalId: externalId ? String(externalId) : undefined,
  };
}

export const conversationsService = {
  getConversations: async (): Promise<Conversation[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockConversations;
    }
    const { data } = await api.get<unknown>('/conversas');
    return unwrapList<Partial<Conversation> & Record<string, unknown>>(data)
      .filter((row) => row && row.id)
      .map(normalizeConversation);
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    if (USE_MOCK) {
      await delay(300);
      return messagesStore[conversationId] ?? [];
    }
    const { data } = await api.get<unknown>(`/conversas/${conversationId}/mensagens`);
    return unwrapList<Partial<Message> & Record<string, unknown>>(data).map(normalizeMessage);
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
