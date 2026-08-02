import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ComingSoonBadge, DemoNotice } from '@/components/ui/DemoNotice';
import { Loading } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useNotification } from '@/contexts/NotificationContext';
import { useIntegrations } from '@/hooks/usePlatform';
import { isIntegrationLive } from '@/utils/featureAvailability';
import type { Integration } from '@/types';
import { motion } from 'framer-motion';
import { ExternalLink, Link2, Plug, Settings } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const categoryLabels = {
  crm: 'CRM',
  erp: 'ERP',
  ecommerce: 'E-commerce',
  marketing: 'Marketing',
};

export function IntegrationsPage() {
  const navigate = useNavigate();
  const { data: integrations, isLoading } = useIntegrations();
  const { addToast } = useNotification();
  const [selected, setSelected] = useState<Integration | null>(null);

  const showComingSoon = (name: string) => {
    addToast({
      title: 'Em breve',
      message: `${name} ainda não está integrado. Hoje apenas Mercos está ativo.`,
      type: 'info',
    });
  };

  const handleCardAction = (integration: Integration) => {
    if (!isIntegrationLive(integration.id, integration.name)) {
      showComingSoon(integration.name);
      return;
    }
    if (integration.connected) {
      setSelected(integration);
      return;
    }
    navigate('/configuracoes');
  };

  if (isLoading) return <Loading />;

  const items = integrations ?? [];
  const liveItems = items.filter((i) => isIntegrationLive(i.id, i.name));
  const previewItems = items.filter((i) => !isIntegrationLive(i.id, i.name));

  const groupedLive = liveItems.reduce<Record<string, Integration[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const groupedPreview = previewItems.reduce<Record<string, Integration[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const renderGroup = (title: string, grouped: Record<string, Integration[]>, live: boolean) => (
    Object.entries(grouped).map(([category, categoryItems]) => (
      <div key={`${title}-${category}`}>
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          {categoryLabels[category as keyof typeof categoryLabels] ?? category}
          {!live && <span className="ml-2 text-sm font-normal text-gray-500">— Em breve</span>}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryItems?.map((integration) => (
            <Card key={integration.id} className={!live ? '!p-4 opacity-75' : '!p-4'}>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 font-bold text-gray-600 dark:bg-gray-800">
                  {integration.name.slice(0, 2).toUpperCase()}
                </div>
                {live ? (
                  <Badge variant={integration.connected ? 'success' : 'default'}>
                    {integration.connected ? 'Ativo' : 'Configurar'}
                  </Badge>
                ) : (
                  <ComingSoonBadge />
                )}
              </div>
              <h3 className="mt-3 font-medium">{integration.name}</h3>
              <Button
                variant={live && integration.connected ? 'outline' : 'primary'}
                size="sm"
                className="mt-3 w-full"
                onClick={() => handleCardAction(integration)}
              >
                {live ? (
                  <>
                    {integration.connected ? <Settings className="h-4 w-4" /> : <Plug className="h-4 w-4" />}
                    {integration.connected ? 'Gerenciar' : 'Configurar Mercos'}
                  </>
                ) : (
                  <>
                    <Plug className="h-4 w-4" />
                    Em breve
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    ))
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Integrações</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Mercos ativo hoje — demais CRMs e ERPs em desenvolvimento
        </p>
      </div>

      <DemoNotice variant="comingSoon" />

      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30">
            <Link2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">
              {liveItems.filter((i) => i.connected).length} integração ativa (Mercos)
            </p>
            <p className="text-sm text-gray-500">
              Tokens e sincronização em Configurações → Mercos.
            </p>
          </div>
          <Button
            variant="outline"
            className="ml-auto"
            onClick={() => addToast({ title: 'Solicitação enviada', message: 'Nossa equipe entrará em contato em até 24h', type: 'info' })}
          >
            <ExternalLink className="h-4 w-4" /> Solicitar integração
          </Button>
        </div>
      </Card>

      {liveItems.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Disponíveis agora</h2>
          {renderGroup('live', groupedLive, true)}
        </div>
      )}

      {previewItems.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Roadmap</h2>
          {renderGroup('preview', groupedPreview, false)}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Gerenciar ${selected?.name}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
            <Button onClick={() => navigate('/configuracoes')}>Abrir configurações</Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <p>
              A integração <strong>{selected.name}</strong> é configurada em Configurações (tokens, sync e logs).
            </p>
            <p className="text-gray-500">Use o painel Mercos para sincronizar clientes, produtos e pedidos.</p>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
