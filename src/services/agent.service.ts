import { USE_MOCK } from '@/config/runtime';
import { mockAgentStatus } from '@/data/mocks';
import { buildAiContext, contextToPrompt } from '@/services/ai/contextBuilder';
import {
  generateConversationSuggestion,
  generateIntelligentReply,
} from '@/services/ai/intelligentEngine';
import { callOpenAI } from '@/services/ai/openaiProvider';
import { aiSettingsStore } from '@/store/aiSettingsStore';
import { delay } from '@/utils';
import type {
  AgentChatRequest,
  AgentChatResponse,
  AgentContext,
  AgentStatus,
  ConversationSuggestion,
  Message,
} from '@/types';
import { api } from './api';

async function fetchAgentContext(
  conversationId?: string,
  customerId?: string,
  message?: string,
): Promise<AgentContext> {
  const { data } = await api.get<AgentContext>('/agent/context', {
    params: { conversationId, customerId, message },
  });
  return {
    ...data,
    messages: data.messages ?? [],
    productsCatalog: data.productsCatalog ?? '',
  };
}

async function resolveReply(payload: AgentChatRequest): Promise<{ reply: string; source: 'openai' | 'intelligent' }> {
  const ctx = USE_MOCK
    ? buildAiContext({
        conversationId: payload.conversationId,
        customerId: payload.customerId,
        history: payload.history?.map((h, i) => ({
          id: `h-${i}`,
          conversationId: payload.conversationId ?? '',
          content: h.content,
          sender: h.role === 'user' ? 'customer' : 'ai',
          timestamp: new Date().toISOString(),
          status: 'read' as const,
        })),
      })
    : await fetchAgentContext(payload.conversationId, payload.customerId);

  const mode = payload.mode ?? 'copilot';
  const systemPrompt = contextToPrompt(ctx);

  if (aiSettingsStore.isConfigured()) {
    try {
      const history = (payload.history ?? []).map((h) => ({
        role: h.role,
        content: h.content,
      }));
      const reply = await callOpenAI(payload.message, systemPrompt, history, mode);
      return { reply, source: 'openai' };
    } catch {
      // fallback to intelligent engine if OpenAI fails
    }
  }

  if (USE_MOCK) {
    await delay(450);
    const reply = generateIntelligentReply(payload.message, ctx, mode);
    return { reply, source: 'intelligent' };
  }

  const { data } = await api.post<AgentChatResponse>('/agent/chat', payload);
  return { reply: data.reply, source: data.source ?? 'intelligent' };
}

export const agentService = {
  getStatus: async (): Promise<AgentStatus> => {
    if (USE_MOCK) {
      await delay(400);
      const configured = aiSettingsStore.isConfigured();
      return {
        ...mockAgentStatus,
        model: configured ? aiSettingsStore.get().model : 'ChatBô IA Pro',
        online: true,
      };
    }
    const { data } = await api.get<AgentStatus>('/agent/status');
    return data;
  },

  chat: async (payload: AgentChatRequest): Promise<AgentChatResponse> => {
    if (USE_MOCK) {
      const { reply, source } = await resolveReply(payload);
      return {
        reply,
        conversationId: payload.conversationId ?? `conv-${Date.now()}`,
        source,
      };
    }
    const { data } = await api.post<AgentChatResponse>('/agent/chat', payload);
    return data;
  },

  suggestForConversation: async (
    conversationId: string,
    customerId?: string,
    extraMessages?: Message[],
  ): Promise<ConversationSuggestion & { source: 'openai' | 'intelligent' }> => {
    if (!USE_MOCK) {
      const { data } = await api.post<ConversationSuggestion & { source: 'openai' | 'intelligent' }>(
        '/agent/suggest',
        { conversationId, customerId },
      );
      return data;
    }

    const ctx = buildAiContext({
      conversationId,
      customerId,
      history: extraMessages,
    });

    if (aiSettingsStore.isConfigured()) {
      try {
        const prompt = `Com base no contexto, retorne JSON exatamente neste formato:
{"insight":"1 frase de análise","suggestion":"mensagem pronta para enviar ao cliente","priority":"low|medium|high"}

Última mensagem do cliente: ${ctx.lastCustomerMessage ?? ''}`;
        const raw = await callOpenAI(prompt, contextToPrompt(ctx), [], 'suggestion');
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as ConversationSuggestion;
          return { ...parsed, source: 'openai' };
        }
      } catch {
        // fallback
      }
    }

    await delay(400);
    return { ...generateConversationSuggestion(ctx), source: 'intelligent' };
  },

  restart: async (): Promise<void> => {
    if (USE_MOCK) {
      await delay(1200);
      return;
    }
    await api.post('/agent/restart');
  },

  getAiMode: (): 'openai' | 'intelligent' =>
    aiSettingsStore.isConfigured() ? 'openai' : 'intelligent',
};
