import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ComingSoonBadge, DemoNotice } from '@/components/ui/DemoNotice';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/EmptyState';
import { ChannelsEmptyState } from '@/components/ui/GuidedEmptyState';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useNotification } from '@/contexts/NotificationContext';
import { usePlatformMutations } from '@/hooks/usePlatformMutations';
import { useChannels } from '@/hooks/usePlatform';
import { channelConfig } from '@/utils/channels';
import { isChannelLive } from '@/utils/featureAvailability';
import { formatDateTime } from '@/utils';
import type { Channel, ChannelType } from '@/types';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Settings } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const channelTypes: { value: ChannelType; label: string; live: boolean }[] = [
  { value: 'whatsapp', label: 'WhatsApp', live: true },
  { value: 'instagram', label: 'Instagram', live: false },
  { value: 'facebook', label: 'Facebook', live: false },
  { value: 'telegram', label: 'Telegram', live: false },
  { value: 'webchat', label: 'WebChat', live: false },
  { value: 'sms', label: 'SMS', live: false },
  { value: 'email', label: 'E-mail', live: false },
];

export function ChannelsPage() {
  const navigate = useNavigate();
  const { data: channels, isLoading, refetch, isFetching } = useChannels();
  const { connectChannel, updateChannel, toggleChannel } = usePlatformMutations();
  const { addToast } = useNotification();

  const [connectOpen, setConnectOpen] = useState(false);
  const [configChannel, setConfigChannel] = useState<Channel | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<Channel | null>(null);
  const [newType, setNewType] = useState<ChannelType>('whatsapp');
  const [newName, setNewName] = useState('');
  const [configName, setConfigName] = useState('');
  const [configPhone, setConfigPhone] = useState('');

  const showComingSoon = (label: string) => {
    addToast({
      title: 'Em breve',
      message: `${label} ainda não está disponível. Hoje apenas WhatsApp (API Meta) está ativo.`,
      type: 'info',
    });
  };

  const handleConnect = async () => {
    if (!isChannelLive(newType)) {
      showComingSoon(channelTypes.find((t) => t.value === newType)?.label ?? 'Este canal');
      return;
    }
    if (!newName.trim()) {
      addToast({ title: 'Nome obrigatório', message: 'Informe um nome para o canal', type: 'warning' });
      return;
    }
    await connectChannel.mutateAsync({ type: newType, name: newName.trim() });
    addToast({ title: 'Canal conectado', message: `${newName} foi adicionado com sucesso`, type: 'success' });
    setConnectOpen(false);
    setNewName('');
  };

  const openConfig = (channel: Channel) => {
    if (!isChannelLive(channel.type)) {
      showComingSoon(channel.name);
      return;
    }
    if (channel.type === 'whatsapp') {
      addToast({
        title: 'Configurar WhatsApp',
        message: 'Use Configurações → WhatsApp para conectar a API Meta.',
        type: 'info',
      });
      return;
    }
    setConfigChannel(channel);
    setConfigName(channel.name);
    setConfigPhone(channel.phone ?? '');
  };

  const handleSaveConfig = async () => {
    if (!configChannel) return;
    await updateChannel.mutateAsync({
      id: configChannel.id,
      patch: { name: configName, phone: configPhone || undefined },
    });
    addToast({ title: 'Canal atualizado', message: 'Configurações salvas', type: 'success' });
    setConfigChannel(null);
  };

  const handleToggle = async () => {
    if (!confirmToggle) return;
    if (!isChannelLive(confirmToggle.type)) {
      showComingSoon(confirmToggle.name);
      setConfirmToggle(null);
      return;
    }
    await toggleChannel.mutateAsync(confirmToggle.id);
    addToast({
      title: confirmToggle.connected ? 'Canal desconectado' : 'Canal conectado',
      message: confirmToggle.name,
      type: 'success',
    });
    setConfirmToggle(null);
  };

  const openRegisterWhatsApp = () => {
    setNewType('whatsapp');
    setNewName('WhatsApp Vendas');
    setConnectOpen(true);
  };

  if (isLoading) return <Loading />;

  const allChannels = channels ?? [];
  const liveChannels = allChannels.filter((c) => isChannelLive(c.type));
  const previewChannels = allChannels.filter((c) => !isChannelLive(c.type));
  const isEmpty = allChannels.length === 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Canais</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            WhatsApp ativo hoje — demais canais omnichannel em desenvolvimento
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
          <Button onClick={() => setConnectOpen(true)}>
            <Plus className="h-4 w-4" /> Conectar canal
          </Button>
        </div>
      </div>

      <DemoNotice variant="comingSoon" />

      <Card className="!p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">WhatsApp (API Meta)</p>
            <p className="text-sm text-gray-500">
              Conecte número, token e webhook em Configurações para receber e enviar mensagens reais.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/configuracoes')}>
            Abrir configurações WhatsApp
          </Button>
        </div>
      </Card>

      {isEmpty ? (
        <ChannelsEmptyState onRegisterWhatsApp={openRegisterWhatsApp} />
      ) : (
        <>
      {liveChannels.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Canais ativos</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveChannels.map((channel) => {
              const config = channelConfig[channel.type];
              const Icon = config.icon;
              return (
                <Card key={channel.id}>
                  <div className="flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.bg}`}>
                      <Icon className={`h-6 w-6 ${config.color}`} />
                    </div>
                    <button type="button" onClick={() => setConfirmToggle(channel)}>
                      <Badge variant={channel.connected ? 'success' : 'danger'} className="cursor-pointer">
                        {channel.connected ? 'Conectado' : 'Desconectado'}
                      </Badge>
                    </button>
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{channel.name}</h3>
                  <ChannelBadge channel={channel.type} className="mt-2" />
                  {channel.providerStatus && (
                    <p className="mt-1 text-xs text-gray-400">API Meta · {channel.providerStatus}</p>
                  )}
                  {channel.phone && <p className="mt-2 text-sm text-gray-500">{channel.phone}</p>}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                    <div>
                      <p className="font-display text-3xl font-bold tabular-nums text-gray-900 dark:text-white">{channel.messagesToday}</p>
                      <p className="text-xs text-gray-500">mensagens hoje</p>
                    </div>
                    {channel.lastActivity && (
                      <p className="text-xs text-gray-400">Ativo {formatDateTime(channel.lastActivity)}</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => openConfig(channel)}>
                    <Settings className="h-4 w-4" /> Configurar
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {previewChannels.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Em breve</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {previewChannels.map((channel) => {
              const config = channelConfig[channel.type];
              const Icon = config.icon;
              return (
                <Card key={channel.id} className="opacity-75">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.bg}`}>
                      <Icon className={`h-6 w-6 ${config.color}`} />
                    </div>
                    <ComingSoonBadge />
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{channel.name}</h3>
                  <ChannelBadge channel={channel.type} className="mt-2" />
                  <p className="mt-3 text-xs text-gray-500">
                    Pré-visualização — conexão real ainda não disponível.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => showComingSoon(channel.name)}
                  >
                    Saiba mais
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}
        </>
      )}

      <Modal
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        title="Conectar novo canal"
        footer={
          <>
            <Button variant="outline" onClick={() => setConnectOpen(false)}>Cancelar</Button>
            <Button onClick={handleConnect} loading={connectChannel.isPending} disabled={!isChannelLive(newType)}>
              Conectar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Tipo de canal"
            options={channelTypes.map((t) => ({
              value: t.value,
              label: t.live ? t.label : `${t.label} (Em breve)`,
              disabled: !t.live,
            }))}
            value={newType}
            onChange={(e) => setNewType(e.target.value as ChannelType)}
          />
          {!isChannelLive(newType) && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Este canal ainda não está disponível. Selecione WhatsApp para conectar agora.
            </p>
          )}
          <Input
            label="Nome do canal"
            placeholder="Ex: WhatsApp Vendas"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={!isChannelLive(newType)}
          />
        </div>
      </Modal>

      <Modal
        open={!!configChannel}
        onClose={() => setConfigChannel(null)}
        title="Configurar canal"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfigChannel(null)}>Cancelar</Button>
            <Button onClick={handleSaveConfig} loading={updateChannel.isPending}>Salvar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nome" value={configName} onChange={(e) => setConfigName(e.target.value)} />
          <Input label="Telefone / identificador" value={configPhone} onChange={(e) => setConfigPhone(e.target.value)} />
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleToggle}
        loading={toggleChannel.isPending}
        title={confirmToggle?.connected ? 'Desconectar canal?' : 'Conectar canal?'}
        message={`Deseja ${confirmToggle?.connected ? 'desconectar' : 'conectar'} o canal "${confirmToggle?.name}"?`}
        confirmLabel={confirmToggle?.connected ? 'Desconectar' : 'Conectar'}
        variant={confirmToggle?.connected ? 'danger' : 'primary'}
      />
    </motion.div>
  );
}
