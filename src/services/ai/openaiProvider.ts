import { aiSettingsStore } from '@/store/aiSettingsStore';
import type { AgentMode } from '@/types';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const MODE_INSTRUCTIONS: Record<AgentMode, string> = {
  agent:
    'Você é o Assistente ChatBô. Resolva a dúvida do cliente por completo, cite dados reais do contexto e seja empático.',
  copilot:
    'Você é o Assistente ChatBô. Ajude o ATENDENTE a resolver QUALQUER dúvida do cliente. ' +
    'Estruture: Diagnóstico → Resposta com dados reais → Mensagem pronta entre aspas → Próximo passo. ' +
    'Nunca invente preços ou estoque. Antecipe objeções (frete, prazo, desconto).',
  suggestion:
    'Retorne APENAS JSON: {"insight":"...","suggestion":"mensagem pronta para o cliente","priority":"low|medium|high"}',
};

export async function callOpenAI(
  userMessage: string,
  systemContext: string,
  history: ChatMessage[] = [],
  mode: AgentMode = 'copilot',
): Promise<string> {
  const settings = aiSettingsStore.get();

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `${MODE_INSTRUCTIONS[mode]}\n\n${systemContext}`,
    },
    ...history.slice(-10),
    { role: 'user', content: userMessage },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      temperature: settings.temperature,
      max_tokens: 2500,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } })?.error?.message ?? response.statusText;
    throw new Error(`OpenAI: ${msg}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  return data.choices[0]?.message?.content?.trim() ?? 'Não foi possível gerar resposta.';
}
