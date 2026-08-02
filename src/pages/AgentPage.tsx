import { ChatBubble } from '@/components/chat/ChatBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { Loading } from '@/components/ui/EmptyState';
import { useAgentStatus } from '@/hooks/useQueries';
import { agentService } from '@/services/agent.service';
import type { Message } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bot, Clock, MessageSquare, Zap } from 'lucide-react';
import { useState } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

export function AgentPage() {
  const { data: status, isLoading } = useAgentStatus();
  const { addToast } = useNotification();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      conversationId: 'agent-test',
      content: 'Olá! Sou o Assistente ChatBô. Como posso ajudar?',
      sender: 'ai',
      timestamp: new Date().toISOString(),
      status: 'read',
    },
  ]);

  const chatMutation = useMutation({
    mutationFn: (content: string) =>
      agentService.chat({
        message: content,
        conversationId: 'agent-test',
        mode: 'agent',
        history: messages
          .filter((m) => m.id !== 'welcome')
          .map((m) => ({
            role: (m.sender === 'customer' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: m.content,
          })),
      }),
    onSuccess: (response, content) => {
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        conversationId: 'agent-test',
        content,
        sender: 'customer',
        timestamp: new Date().toISOString(),
        status: 'read',
      };
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        conversationId: 'agent-test',
        content: response.reply,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        status: 'read',
      };
      setMessages((prev) => [...prev, userMsg, aiMsg]);
    },
  });

  const handleSend = (content: string) => {
    chatMutation.mutate(content);
  };

  const restartMutation = useMutation({
    mutationFn: () => agentService.restart(),
    onSuccess: () => {
      setMessages([
        {
          id: 'welcome',
          conversationId: 'agent-test',
      content: 'Olá! Sou o Assistente ChatBô. Como posso ajudar?',
          sender: 'ai',
          timestamp: new Date().toISOString(),
          status: 'read',
        },
      ]);
      addToast({ title: 'Agente reiniciado', message: 'Sessão de teste resetada', type: 'success' });
    },
  });

  if (isLoading) return <Loading />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assistente ChatBô</h1>
        <p className="text-gray-500 dark:text-gray-400">Painel e teste do agente inteligente</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Status"
          value={status?.online ? 'Online' : 'Offline'}
          icon={Bot}
          variant={status?.online ? 'success' : 'warning'}
        />
        <StatCard title="Modelo" value={status?.model ?? '-'} icon={Zap} variant="primary" />
        <StatCard title="Tempo médio" value={status?.avgResponseTime ?? '-'} icon={Clock} />
        <StatCard title="Perguntas respondidas" value={status?.questionsAnswered ?? 0} icon={MessageSquare} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Testar Agente" subtitle="Converse diretamente com o agente de IA">
          <div className="flex h-[400px] flex-col rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
              <span className="text-sm font-medium">Chat de teste</span>
              <Badge variant={status?.online ? 'success' : 'danger'}>
                {status?.online ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-950">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              {chatMutation.isPending && (
                <p className="text-sm text-gray-400">Agente pensando...</p>
              )}
            </div>
            <MessageInput
              onSend={handleSend}
              disabled={chatMutation.isPending || !status?.online}
              placeholder="Teste o agente..."
            />
          </div>
        </Card>

        <Card title="Configuração" subtitle="Informações do agente">
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-800">
              <span className="text-gray-500">Modelo</span>
              <span className="font-medium">{status?.model}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-800">
              <span className="text-gray-500">Endpoint</span>
              <span className="font-mono text-xs">POST /agent/chat</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-800">
              <span className="text-gray-500">Status</span>
              <Badge variant={status?.online ? 'success' : 'danger'}>
                {status?.online ? 'Operacional' : 'Indisponível'}
              </Badge>
            </div>
            <Button variant="outline" className="w-full" onClick={() => restartMutation.mutate()} loading={restartMutation.isPending}>
              <Bot className="h-4 w-4" /> Reiniciar agente
            </Button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
