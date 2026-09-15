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
    sessionIds: Array.isArray(raw.sessionIds) ? raw.sessionIds.map(String) : [String(raw.id)],
    activeSessionId: raw.activeSessionId ? String(raw.activeSessionId) : String(raw.id),
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
    mediaType: raw.mediaType,
    mediaFilename: raw.mediaFilename,
    mediaContentType: raw.mediaContentType,
    mediaByteSize: raw.mediaByteSize,
    mediaUrl: raw.mediaUrl,
  };
}

function samePendingMessage(existing: Message, incoming: Message): boolean {
  if (!existing.id.startsWith('pending-') || existing.sender !== incoming.sender) return false;
  const existingContent = existing.content.trim();
  const incomingContent = incoming.content.trim();
  const contentMatches = incomingContent === existingContent || incomingContent.endsWith(existingContent);
  const timeDistance = Math.abs(
    new Date(incoming.timestamp).getTime() - new Date(existing.timestamp).getTime(),
  );
  return contentMatches && timeDistance < 120_000;
}

export function mergeConversationMessages(current: Message[], incoming: Message[]): Message[] {
  const merged = [...current];
  for (const message of incoming) {
    const index = merged.findIndex((item) =>
      item.id === message.id
      || Boolean(item.externalId && message.externalId && item.externalId === message.externalId)
      || samePendingMessage(item, message),
    );
    if (index >= 0) merged[index] = message;
    else merged.push(message);
  }
  return merged.sort(
    (left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime() || left.id.localeCompare(right.id),
  );
}

export const conversationsService = {
  getConversations: async (options?: { signal?: AbortSignal }): Promise<Conversation[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockConversations;
    }
    const { data } = await api.get<unknown>('/conversas', { params: { limit: 60, scope: 'contact' }, signal: options?.signal });
    return unwrapList<Partial<Conversation> & Record<string, unknown>>(data)
      .filter((row) => row && row.id)
      .map(normalizeConversation);
  },

  getMessages: async (
    conversationId: string,
    options?: { after?: string; before?: string; beforeId?: string; limit?: number },
  ): Promise<Message[]> => {
    if (USE_MOCK) {
      await delay(300);
      const limit = options?.limit ?? 60;
      const filtered = (messagesStore[conversationId] ?? []).filter((message) => {
        const timestamp = new Date(message.timestamp).getTime();
        if (options?.before && timestamp >= new Date(options.before).getTime()) return false;
        if (options?.after && timestamp <= new Date(options.after).getTime()) return false;
        return true;
      });
      return filtered.slice(-limit);
    }
    const { data } = await api.get<unknown>(`/conversas/${conversationId}/mensagens`, {
      params: {
        limit: options?.limit ?? 60,
        scope: 'contact',
        after: options?.after,
        before: options?.before,
        beforeId: options?.beforeId,
      },
    });
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
      { content, sender }, { params: { scope: 'contact' } },
    );
    return data;
  },

  sendMedia: async (conversationId: string, file: File, caption = ''): Promise<Message> => {
    if (USE_MOCK) {
      await delay(200);
      const mediaType = file.type.startsWith('image/') ? 'image'
        : file.type.startsWith('audio/') ? 'audio' : 'document';
      const message: Message = {
        id: `media-${Date.now()}`, conversationId, content: caption || `[${mediaType}: ${file.name}]`,
        sender: 'agent', timestamp: new Date().toISOString(), status: 'sent',
        mediaType, mediaFilename: file.name, mediaContentType: file.type,
        mediaByteSize: file.size, mediaUrl: URL.createObjectURL(file),
      };
      messagesStore = { ...messagesStore, [conversationId]: [...(messagesStore[conversationId] ?? []), message] };
      return message;
    }
    const form = new FormData();
    form.append('file', file);
    form.append('caption', caption);
    const { data } = await api.post<Message>(`/conversas/${conversationId}/midia`, form, { params: { scope: 'contact' } });
    return normalizeMessage(data as Message & Record<string, unknown>);
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
      { assigneeId }, { params: { scope: 'contact' } },
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
      `/conversas/${conversationId}/assumir`, undefined, { params: { scope: 'contact' } },
    );
    return data;
  },

  markRead: async (conversationId: string): Promise<Conversation> => {
    if (USE_MOCK) {
      await delay(100);
      const conv = mockConversations.find((c) => c.id === conversationId);
      if (!conv) throw new Error('Conversa não encontrada');
      return { ...conv, unreadCount: 0 };
    }
    const { data } = await api.patch<Conversation>(`/conversas/${conversationId}/lida`, undefined, { params: { scope: 'contact' } });
    return normalizeConversation(data as Conversation & Record<string, unknown>);
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
      note ? { note } : {}, { params: { scope: 'contact' } },
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
      `/conversas/${conversationId}/reativar`, undefined, { params: { scope: 'contact' } },
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
      payload, { params: { scope: 'contact' } },
    );
    return data;
  },
};
