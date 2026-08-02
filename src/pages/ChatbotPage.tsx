import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useNotification } from '@/contexts/NotificationContext';
import { usePlatformMutations } from '@/hooks/usePlatformMutations';
import { useChatbots } from '@/hooks/usePlatform';
import { chatbotService } from '@/services/platform.service';
import type { ChannelType, ChatbotFlow } from '@/types';
import { motion } from 'framer-motion';
import { Bot, Clock, MessageSquare, Plus, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export function ChatbotPage() {
  const { data: flows, isLoading } = useChatbots();
  const queryClient = useQueryClient();
  const { createChatbot, updateChatbot, toggleChatbot } = usePlatformMutations();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [editFlow, setEditFlow] = useState<ChatbotFlow | null>(null);
  const [form, setForm] = useState({ name: '', channel: 'whatsapp' as ChannelType, active: true });
  const [testingId, setTestingId] = useState<string | null>(null);

  const totalResolved = (flows ?? []).reduce((s, f) => s + f.resolved, 0);
  const totalTriggers = (flows ?? []).reduce((s, f) => s + f.triggers, 0);
  const resolutionRate = totalTriggers > 0 ? Math.round((totalResolved / totalTriggers) * 100) : 0;

  const handleCreate = async () => {
    if (!form.name.trim()) {
      addToast({ title: 'Nome obrigatório', type: 'warning' });
      return;
    }
    await createChatbot.mutateAsync(form);
    addToast({ title: 'Fluxo criado', message: form.name, type: 'success' });
    setCreateOpen(false);
    setForm({ name: '', channel: 'whatsapp', active: true });
  };

  const handleEdit = async () => {
    if (!editFlow) return;
    await updateChatbot.mutateAsync({ id: editFlow.id, patch: form });
    addToast({ title: 'Fluxo atualizado', type: 'success' });
    setEditFlow(null);
  };

  const handleTest = async (flow: ChatbotFlow) => {
    if (!flow.active) {
      addToast({
        title: 'Fluxo inativo',
        message: 'Ative o fluxo antes de testar',
        type: 'warning',
      });
      return;
    }
    setTestingId(flow.id);
    try {
      const result = await chatbotService.test(flow.id, {
        message: 'Olá, preciso de ajuda com meu pedido',
      });
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: ['chatbots'] });
        addToast({
          title: 'Agente respondeu',
          message: result.reply?.slice(0, 120) ?? 'Resposta gerada com sucesso',
          type: 'success',
        });
        navigate(`/atendimento?conversa=${result.conversationId}`);
      } else {
        addToast({
          title: 'Agente nao respondeu',
          message: result.message ?? 'Verifique se há atendente humano na conversa',
          type: 'warning',
        });
      }
    } catch {
      addToast({ title: 'Erro no teste', message: 'Não foi possível executar o fluxo', type: 'error' });
    } finally {
      setTestingId(null);
    }
  };

  const handleToggle = async (flow: ChatbotFlow) => {
    await toggleChatbot.mutateAsync(flow.id);
    addToast({
      title: flow.active ? 'Fluxo desativado' : 'Fluxo ativado',
      message: flow.name,
      type: 'success',
    });
  };

  if (isLoading) return <Loading />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agente Automatico</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Qualificacao e respostas automaticas com IA quando o lead envia mensagem — WhatsApp e simulacao
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Novo fluxo
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Fluxos ativos" value={(flows ?? []).filter((f) => f.active).length} icon={Bot} variant="primary" />
        <StatCard title="Ativações" value={totalTriggers.toLocaleString('pt-BR')} icon={Zap} />
        <StatCard title="Resolvidos pelo bot" value={totalResolved.toLocaleString('pt-BR')} icon={MessageSquare} variant="success" />
        <StatCard title="Taxa de resolução" value={`${resolutionRate}%`} icon={Clock} variant="warning" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(flows ?? []).map((flow) => (
          <Card key={flow.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{flow.name}</h3>
                  <ChannelBadge channel={flow.channel} className="mt-1" />
                </div>
              </div>
              <button type="button" onClick={() => handleToggle(flow)}>
                <Badge variant={flow.active ? 'success' : 'default'} className="cursor-pointer">
                  {flow.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
              <div>
                <p className="text-2xl font-bold">{flow.triggers}</p>
                <p className="text-xs text-gray-500">Ativações</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{flow.resolved}</p>
                <p className="text-xs text-gray-500">Resolvidos</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setEditFlow(flow);
                  setForm({ name: flow.name, channel: flow.channel, active: flow.active });
                }}
              >
                Editar fluxo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleTest(flow)}
                loading={testingId === flow.id}
                disabled={!flow.active}
              >
                Testar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo fluxo" footer={
        <>
          <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} loading={createChatbot.isPending}>Criar</Button>
        </>
      }>
        <div className="space-y-4">
          <Input label="Nome do fluxo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Triagem Inicial" />
          <Select label="Canal" options={[{ value: 'whatsapp', label: 'WhatsApp' }, { value: 'webchat', label: 'WebChat' }, { value: 'instagram', label: 'Instagram' }]} value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as ChannelType })} />
        </div>
      </Modal>

      <Modal open={!!editFlow} onClose={() => setEditFlow(null)} title="Editar fluxo" footer={
        <>
          <Button variant="outline" onClick={() => setEditFlow(null)}>Cancelar</Button>
          <Button onClick={handleEdit} loading={updateChatbot.isPending}>Salvar</Button>
        </>
      }>
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Canal" options={[{ value: 'whatsapp', label: 'WhatsApp' }, { value: 'webchat', label: 'WebChat' }, { value: 'instagram', label: 'Instagram' }]} value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as ChannelType })} />
        </div>
      </Modal>
    </motion.div>
  );
}
