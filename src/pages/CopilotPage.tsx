import { ChatBubble } from '@/components/chat/ChatBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { Loading } from '@/components/ui/EmptyState';
import { useAgentStatus, useConversations } from '@/hooks/useQueries';
import { agentService } from '@/services/agent.service';
import type { Conversation, Message } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Bot,
  BarChart3,
  FileText,
  GitBranch,
  Target,
  Sparkles,
  TrendingUp,
  Wand2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Select } from '@/components/ui/Select';
import { useNotification } from '@/contexts/NotificationContext';

function buildQuickTools(conversations: Conversation[], contextConvId: string) {
  const selected =
    conversations.find((c) => c.id === contextConvId) ?? conversations[0];
  const name = selected?.customerName ?? 'o cliente';

  return [
    {
      icon: FileText,
      title: 'Resumo da oportunidade',
      desc: 'Sintetiza contexto, interesse e próximos passos',
      prompt: selected ? `Resuma a conversa de ${name}` : 'Resuma a conversa mais recente',
      conversationId: selected?.id,
    },
    {
      icon: Target,
      title: 'Analisar objeção',
      desc: 'Identifica travas comerciais e argumentos',
      prompt: selected
        ? `Transcreva e analise a mensagem de ${name}`
        : 'Transcreva a última mensagem do cliente',
      conversationId: selected?.id,
    },
    {
      icon: Wand2,
      title: 'Gerar resposta comercial',
      desc: 'Cria uma resposta pronta para avançar a venda',
      prompt: selected ? `Gere texto profissional para responder ${name}` : 'Gere texto profissional para o cliente',
      conversationId: selected?.id,
    },
    {
      icon: GitBranch,
      title: 'Sugerir proximo passo',
      desc: 'Recomenda follow-up, proposta ou qualificação',
      prompt: selected ? `Sugira resposta para ${name}` : 'Sugira resposta para o cliente',
      conversationId: selected?.id,
    },
  ];
}

export function CopilotPage() {
  const { data: status, isLoading: statusLoading } = useAgentStatus();
  const { data: conversations, isLoading: convLoading } = useConversations();
  const { addToast } = useNotification();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      conversationId: 'copilot',
      content:
        'Sou o Assistente ChatBô. Analiso oportunidades, gero respostas comerciais, consulto pedidos, estoque e métricas de venda com dados reais do Mercos e Supabase. Peça resumos, status de pedido, funil de vendas ou mensagens prontas para enviar ao cliente.',
      sender: 'ai',
      timestamp: new Date().toISOString(),
      status: 'read',
    },
  ]);

  const [contextConvId, setContextConvId] = useState<string>('');

  useEffect(() => {
    if (conversations?.[0]?.id && !contextConvId) {
      setContextConvId(conversations[0].id);
    }
  }, [conversations, contextConvId]);

  const contextConv = useMemo(
    () => (conversations ?? []).find((c) => c.id === contextConvId),
    [conversations, contextConvId],
  );

  const quickTools = useMemo(
    () => buildQuickTools(conversations ?? [], contextConvId),
    [conversations, contextConvId],
  );

  const chatMutation = useMutation({
    mutationFn: ({ message, conversationId }: { message: string; conversationId?: string }) => {
      const conv = (conversations ?? []).find((c) => c.id === conversationId);
      return agentService.chat({
        message,
        conversationId,
        customerId: conv?.customerId,
        mode: 'copilot',
        history: messages
          .filter((m) => m.id !== 'welcome')
          .map((m) => ({
            role: (m.sender === 'customer' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: m.content,
          })),
      });
    },
    onSuccess: (response, { message }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          conversationId: 'copilot',
          content: message,
          sender: 'customer',
          timestamp: new Date().toISOString(),
          status: 'read',
        },
        {
          id: `a-${Date.now()}`,
          conversationId: 'copilot',
          content: response.reply,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          status: 'read',
          aiSource: response.source,
        },
      ]);
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (err as Error)?.message ??
        'Falha ao contactar o Assistente ChatBô';
      addToast({ title: 'Assistente ChatBô indisponível', message: String(detail), type: 'error' });
    },
  });

  const primaryConv = contextConv ?? conversations?.[0];
  const trackingConv = conversations?.find((c) =>
    c.lastMessage.toLowerCase().match(/pedido|entrega|chega/),
  ) ?? primaryConv;
  const activeConvId = contextConvId || primaryConv?.id;

  if (statusLoading || convLoading) return <Loading />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1220] via-blue-700 to-red-600 p-7 text-white shadow-2xl shadow-blue-900/25">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/15 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-100">
            <Sparkles className="h-3.5 w-3.5" /> Assistente ChatBô
          </span>
          <h1 className="mt-4 font-display text-2xl font-black tracking-tight text-white lg:text-3xl">Assistente ChatBô</h1>
          <p className="mt-2 max-w-3xl text-blue-50/90">
            Use a IA para gerar respostas, analisar oportunidades, consultar pedidos e acelerar negociações com dados reais.
          </p>
        </div>
        {status?.openaiEnabled && status.gptOnly ? (
          <p className="relative mt-4 text-sm text-green-100">
            Modo 100% GPT ativo — {status.model}
          </p>
        ) : status?.openaiEnabled ? (
          <p className="relative mt-4 text-sm text-amber-100">
            OpenAI ativo com fallback local — defina COPILOT_GPT_ONLY=true no Render para 100% GPT
          </p>
        ) : (
          <p className="relative mt-4 text-sm text-amber-100">
            Modo local (limitado) — configure OPENAI_API_KEY no Render para o Assistente ChatBô 100% inteligente com GPT-4o
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Status" value={status?.online ? 'Online' : 'Offline'} icon={Bot} variant={status?.online ? 'success' : 'warning'} />
        <StatCard title="Modelo" value={status?.model ?? '-'} icon={Sparkles} variant="primary" />
        <StatCard title="Tempo médio" value={status?.avgResponseTime ?? '-'} icon={Wand2} />
        <StatCard title="Oportunidades" value={conversations?.length ?? 0} icon={TrendingUp} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickTools.map(({ icon: Icon, title, desc, prompt, conversationId }) => (
          <div
            key={title}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => {
              if (!conversationId) {
                addToast({ title: 'Sem conversas', message: 'Abra Atendimento e crie conversas primeiro', type: 'warning' });
                return;
              }
              addToast({ title, message: 'Processando com o Assistente ChatBô...', type: 'info' });
              chatMutation.mutate({ message: prompt, conversationId });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && conversationId) {
                chatMutation.mutate({ message: prompt, conversationId });
              }
            }}
          >
            <Card className="border-gray-200/80 bg-white/90 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 dark:border-white/10 dark:bg-gray-900/90 dark:hover:border-blue-900/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-red-500 text-white shadow-lg shadow-blue-600/20">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="mt-1 text-sm text-gray-500">{desc}</p>
            </Card>
          </div>
        ))}
      </div>

      <Card title="Workspace comercial ChatBô" subtitle="Converse com a IA usando dados reais da plataforma e contexto da oportunidade" className="border-gray-200/80 bg-white/90 dark:border-white/10 dark:bg-gray-900/90">
        {conversations && conversations.length > 0 && (
          <div className="mb-4 max-w-md">
            <Select
              label="Contexto da oportunidade (cliente + histórico real)"
              value={contextConvId}
              onChange={(e) => setContextConvId(e.target.value)}
              options={conversations.map((c) => ({
                value: c.id,
                label: `${c.customerName} (${c.channel})`,
              }))}
            />
          </div>
        )}
        <div className="flex h-[420px] flex-col overflow-hidden rounded-2xl border border-gray-200/80 dark:border-white/10">
          <div className="flex items-center justify-between border-b border-gray-200/80 bg-slate-50/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <span className="text-sm font-semibold">Chat com Assistente ChatBô</span>
            <div className="flex items-center gap-2">
              {contextConv && (
                <span className="hidden text-xs text-gray-400 sm:inline">
                  Contexto: {contextConv.customerName}
                </span>
              )}
              <Badge variant={status?.online ? 'success' : 'danger'}>
                {status?.online ? 'IA Ativa' : 'Offline'}
              </Badge>
            </div>
          </div>
          <div className="dashboard-grid-bg flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-[#0b1220]">
            {messages.map((msg) => (
              <div key={msg.id}>
                <ChatBubble message={msg} />
                {msg.sender === 'ai' && msg.aiSource && msg.id !== 'welcome' && (
                  <p className="mt-0.5 text-right text-[10px] text-gray-400">
                    {msg.aiSource === 'openai' ? 'GPT · dados reais' : 'Modo local'}
                  </p>
                )}
              </div>
            ))}
            {chatMutation.isPending && <p className="text-sm text-gray-400">Processando...</p>}
          </div>
          <MessageInput
            onSend={(c) => chatMutation.mutate({ message: c, conversationId: contextConvId || primaryConv?.id })}
            disabled={chatMutation.isPending}
            placeholder="Peça métricas de venda, resumo, status de pedido ou resposta comercial..."
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              chatMutation.mutate({
                message: 'Quantas vendas tivemos e qual o valor total vendido?',
                conversationId: activeConvId,
              })
            }
          >
            <BarChart3 className="mr-1.5 h-4 w-4" />
            Métricas de venda
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              chatMutation.mutate({
                message: 'Quanto passou de dinheiro e quanto retemos na receita?',
                conversationId: activeConvId,
              })
            }
          >
            Receita retida
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              chatMutation.mutate({
                message: 'Como está o funil de vendas?',
                conversationId: activeConvId,
              })
            }
          >
            Funil de vendas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              chatMutation.mutate({
                message: 'Liste produtos disponíveis no catálogo',
                conversationId: activeConvId,
              })
            }
          >
            Catálogo
          </Button>
        </div>
        {primaryConv && (
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                chatMutation.mutate({
                  message: `Resuma a conversa de ${primaryConv.customerName}`,
                  conversationId: primaryConv.id,
                })
              }
            >
              Resumo {primaryConv.customerName.split(' ')[0]}
            </Button>
            {trackingConv && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  chatMutation.mutate({
                    message: `Status do pedido de ${trackingConv.customerName}`,
                    conversationId: trackingConv.id,
                  })
                }
              >
                Rastrear pedido
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                chatMutation.mutate({
                  message: 'Qual o tom e urgência desta conversa?',
                  conversationId: primaryConv.id,
                })
              }
            >
              Analisar urgência
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
