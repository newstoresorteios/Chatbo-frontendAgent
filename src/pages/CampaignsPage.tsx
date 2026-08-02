import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/EmptyState';
import { CampaignsEmptyState } from '@/components/ui/GuidedEmptyState';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { useNotification } from '@/contexts/NotificationContext';
import { usePlatformMutations } from '@/hooks/usePlatformMutations';
import { useCampaigns } from '@/hooks/usePlatform';
import { CAMPAIGNS_DISPATCH_LIVE } from '@/utils/featureAvailability';
import { extractApiErrorMessage } from '@/utils/apiErrors';
import { formatDateTime } from '@/utils';
import type { Campaign, ChannelType } from '@/types';
import { motion } from 'framer-motion';
import { Plus, Send } from 'lucide-react';
import { useState } from 'react';

const statusLabels: Record<Campaign['status'], string> = {
  draft: 'Rascunho',
  scheduled: 'Agendada',
  running: 'Em andamento',
  completed: 'Concluída',
};

const statusVariant: Record<Campaign['status'], 'default' | 'info' | 'success' | 'warning'> = {
  draft: 'default',
  scheduled: 'warning',
  running: 'info',
  completed: 'success',
};

export function CampaignsPage() {
  const { data: campaigns, isLoading } = useCampaigns();
  const { createCampaign, dispatchCampaign } = usePlatformMutations();
  const { addToast } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [form, setForm] = useState({
    name: '',
    channel: 'whatsapp' as ChannelType,
    status: 'draft' as Campaign['status'],
    recipients: 100,
    message: '',
    scheduledAt: '',
  });

  const handleCreate = async () => {
    if (!form.name.trim()) {
      addToast({ title: 'Nome obrigatório', type: 'warning' });
      return;
    }
    if (!form.message.trim()) {
      addToast({ title: 'Mensagem obrigatória', message: 'Escreva o texto que será enviado via WhatsApp.', type: 'warning' });
      return;
    }
    try {
      await createCampaign.mutateAsync({
        name: form.name.trim(),
        channel: form.channel,
        status: form.status,
        recipients: form.recipients,
        message: form.message.trim(),
        scheduledAt: form.scheduledAt || undefined,
      });
      addToast({ title: 'Campanha criada', message: form.name, type: 'success' });
      setModalOpen(false);
      setForm({ name: '', channel: 'whatsapp', status: 'draft', recipients: 100, message: '', scheduledAt: '' });
    } catch (err) {
      addToast({ title: 'Erro ao criar campanha', message: extractApiErrorMessage(err), type: 'error' });
    }
  };

  const handleDispatch = async (campaign: Campaign) => {
    if (!campaign.message?.trim()) {
      addToast({
        title: 'Sem mensagem',
        message: 'Esta campanha não tem texto. Crie uma nova com a mensagem preenchida.',
        type: 'warning',
      });
      return;
    }
    try {
      const result = await dispatchCampaign.mutateAsync(campaign.id);
      addToast({
        title: result.success ? 'Disparo concluído' : 'Disparo falhou',
        message: result.message,
        type: result.success ? 'success' : 'error',
      });
      setSelected(null);
    } catch (err) {
      addToast({ title: 'Erro no disparo', message: extractApiErrorMessage(err), type: 'error' });
    }
  };

  if (isLoading) return <Loading />;

  const list = campaigns ?? [];
  const drafts = list.filter((c) => c.status === 'draft').length;
  const running = list.filter((c) => c.status === 'running').length;
  const totalSent = list.reduce((acc, c) => acc + c.sent, 0);

  const columns = [
    { key: 'name', header: 'Campanha' },
    { key: 'channel', header: 'Canal', render: (c: Campaign) => <ChannelBadge channel={c.channel} /> },
    {
      key: 'status',
      header: 'Status',
      render: (c: Campaign) => (
        <Badge variant={statusVariant[c.status]}>{statusLabels[c.status]}</Badge>
      ),
    },
    { key: 'recipients', header: 'Destinatários', render: (c: Campaign) => c.recipients.toLocaleString('pt-BR') },
    {
      key: 'sent',
      header: 'Enviadas',
      render: (c: Campaign) => c.sent.toLocaleString('pt-BR'),
    },
    {
      key: 'failed',
      header: 'Falhas',
      render: (c: Campaign) => (c.failed ? c.failed.toLocaleString('pt-BR') : '—'),
    },
    {
      key: 'opened',
      header: 'Lidas',
      render: (c: Campaign) =>
        c.sent > 0 && c.opened > 0 ? `${Math.round((c.opened / c.sent) * 100)}%` : '—',
    },
    { key: 'scheduledAt', header: 'Agendamento', render: (c: Campaign) => (c.scheduledAt ? formatDateTime(c.scheduledAt) : '-') },
  ];

  const canDispatch = (c: Campaign) =>
    CAMPAIGNS_DISPATCH_LIVE &&
    c.channel === 'whatsapp' &&
    (c.status === 'draft' || c.status === 'scheduled');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Campanhas</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Crie campanhas WhatsApp e dispare para clientes sincronizados do Mercos
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Nova campanha
        </Button>
      </div>

      <Card className="!p-4 text-sm text-gray-600 dark:text-gray-300">
        <p>
          <strong>Destinatários:</strong> clientes com celular/telefone no Mercos (limite pelo campo &quot;Destinatários&quot;; 0 = todos).
        </p>
        <p className="mt-1 text-gray-500">
          Use <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">{'{{nome}}'}</code> na mensagem para personalizar. WhatsApp precisa estar conectado em Canais.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rascunhos</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums">{drafts}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Disparos ativos</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums">{running}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Mensagens enviadas</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums">{totalSent.toLocaleString('pt-BR')}</p>
        </Card>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {list.length === 0 ? (
          <CampaignsEmptyState onCreate={() => setModalOpen(true)} />
        ) : (
          <Table columns={columns} data={list} keyExtractor={(c) => c.id} onRowClick={setSelected} />
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova campanha WhatsApp"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} loading={createCampaign.isPending}>Salvar campanha</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Black Friday 2024" />
          <Select
            label="Canal"
            options={[
              { value: 'whatsapp', label: 'WhatsApp' },
              { value: 'sms', label: 'SMS (Em breve)', disabled: true },
              { value: 'email', label: 'E-mail (Em breve)', disabled: true },
            ]}
            value={form.channel}
            onChange={(e) => setForm({ ...form, channel: e.target.value as ChannelType })}
          />
          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mensagem
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Olá {{nome}}, temos uma oferta especial para você!"
            />
          </div>
          <Input
            label="Destinatários (máx.)"
            type="number"
            min={0}
            value={form.recipients}
            onChange={(e) => setForm({ ...form, recipients: Number(e.target.value) })}
          />
          <p className="text-xs text-gray-500">Use 0 para enviar a todos os clientes com telefone.</p>
          <Select
            label="Status"
            options={[
              { value: 'draft', label: 'Rascunho' },
              { value: 'scheduled', label: 'Agendada' },
            ]}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Campaign['status'] })}
          />
          <Input
            label="Agendar para (opcional)"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
          />
        </div>
      </Modal>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detalhes da campanha"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
            {selected && canDispatch(selected) && (
              <Button
                onClick={() => handleDispatch(selected)}
                loading={dispatchCampaign.isPending}
              >
                <Send className="h-4 w-4" /> Disparar agora
              </Button>
            )}
          </>
        }
      >
        {selected && (
          <div className="space-y-2 text-sm">
            <p><strong>Nome:</strong> {selected.name}</p>
            <p><strong>Status:</strong> {statusLabels[selected.status]}</p>
            <p><strong>Destinatários:</strong> {selected.recipients}</p>
            <p><strong>Enviadas:</strong> {selected.sent}</p>
            {selected.failed ? <p><strong>Falhas:</strong> {selected.failed}</p> : null}
            {selected.dispatchedAt && (
              <p><strong>Disparada em:</strong> {formatDateTime(selected.dispatchedAt)}</p>
            )}
            {selected.message && (
              <div>
                <p className="font-medium">Mensagem:</p>
                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {selected.message}
                </p>
              </div>
            )}
            {selected.lastError && (
              <p className="text-red-600 dark:text-red-400">
                <strong>Último erro:</strong> {selected.lastError}
              </p>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
