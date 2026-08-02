import { ChartPanel, DashboardStatCard } from '@/components/dashboard/DashboardWidgets';
import { SalesFunnel } from '@/components/sales/SalesFunnel';
import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useNotification } from '@/contexts/NotificationContext';
import { usePlatformMutations } from '@/hooks/usePlatformMutations';
import { useFunnel } from '@/hooks/usePlatform';
import { useSalesMetrics } from '@/hooks/useQueries';
import { formatCurrency } from '@/utils';
import type { FunnelDeal } from '@/types';
import { motion } from 'framer-motion';
import { DollarSign, GitBranch, RefreshCw, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

export function FunnelPage() {
  const { data: stages, isLoading: loadingFunnel } = useFunnel();
  const { data: metrics, isLoading: loadingMetrics } = useSalesMetrics();
  const { moveDeal, syncFunnel } = usePlatformMutations();
  const { addToast } = useNotification();
  const [selectedDeal, setSelectedDeal] = useState<FunnelDeal | null>(null);
  const [targetStage, setTargetStage] = useState('');

  const handleMove = async () => {
    if (!selectedDeal || !targetStage || targetStage === selectedDeal.stageId) return;
    await moveDeal.mutateAsync({ dealId: selectedDeal.id, stageId: targetStage });
    const stageName = stages?.find((s) => s.id === targetStage)?.name;
    addToast({ title: 'Negócio movido', message: `"${selectedDeal.title}" → ${stageName}`, type: 'success' });
    setSelectedDeal(null);
  };

  const openDeal = (deal: FunnelDeal) => {
    setSelectedDeal(deal);
    setTargetStage(deal.stageId);
  };

  if (loadingFunnel || loadingMetrics) return <Loading />;

  const closedStageIds = new Set(
    (stages ?? []).filter((s) => /fechado/i.test(s.name)).map((s) => s.id),
  );
  if (closedStageIds.size === 0) closedStageIds.add('s5');

  const openPipelineValue = (stages ?? []).reduce(
    (sum, stage) =>
      closedStageIds.has(stage.id)
        ? sum
        : sum + stage.deals.reduce((s, d) => s + d.value, 0),
    0,
  );

  const handleSync = async () => {
    try {
      const result = await syncFunnel.mutateAsync();
      addToast({ title: 'Funil sincronizado', message: result.message, type: 'success' });
    } catch {
      addToast({
        title: 'Falha ao sincronizar',
        message: 'Verifique pedidos Mercos e tente novamente.',
        type: 'error',
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Funil de Vendas</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Acompanhe a conversão e gerencie oportunidades no pipeline comercial
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            onClick={handleSync}
            loading={syncFunnel.isPending}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Sincronizar com Mercos
          </Button>
          <Card className="!p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Pipeline em aberto</p>
                <p className="font-display text-xl font-bold tabular-nums">{formatCurrency(openPipelineValue)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStatCard
          title="Oportunidades"
          value={metrics?.pipelineNegocios ?? 0}
          icon={GitBranch}
          variant="primary"
          delta={formatCurrency(metrics?.pipelineValor ?? 0)}
        />
        <DashboardStatCard
          title="Pedidos confirmados"
          value={metrics?.quantidadeVendas ?? 0}
          icon={ShoppingCart}
          variant="success"
          delta={formatCurrency(metrics?.valorTotalVendido ?? 0)}
        />
        <DashboardStatCard
          title="Receita retida"
          value={formatCurrency(metrics?.valorRetido ?? 0)}
          icon={DollarSign}
          variant="violet"
          delta={`${metrics?.quantidadeEntregues ?? 0} entregues`}
        />
      </div>

      <ChartPanel
        title="Funil de conversão"
        subtitle="Do primeiro contato até a receita concretizada — estilo Mercado Livre"
        accent="violet"
        delay={0.05}
      >
        <SalesFunnel steps={metrics?.funil ?? []} />
      </ChartPanel>

      <div>
        <h2 className="mb-4 font-display text-lg font-semibold text-gray-900 dark:text-white">Pipeline operacional</h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Negócios gerados a partir de pedidos e conversas reais — clique em um card para mover de estágio
        </p>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {(stages ?? []).map((stage) => (
            <div key={stage.id} className="min-w-[280px] flex-shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">{stage.name}</h3>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium dark:bg-gray-800">
                  {stage.deals.length}
                </span>
              </div>
              <div className="space-y-3">
                {stage.deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="cursor-pointer"
                    onClick={() => openDeal(deal)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openDeal(deal)}
                  >
                    <Card className="!p-4 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:hover:border-blue-900/60">
                      <h4 className="font-medium text-gray-900 dark:text-white">{deal.title}</h4>
                      <p className="mt-1 text-sm text-gray-500">{deal.contact}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-bold text-primary-600">{formatCurrency(deal.value)}</span>
                        <ChannelBadge channel={deal.channel} showLabel={false} />
                      </div>
                    </Card>
                  </div>
                ))}
                {stage.deals.length === 0 && (
                  <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center text-sm text-gray-400 dark:border-gray-700">
                    Nenhuma oportunidade
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
        title={selectedDeal?.title ?? 'Negócio'}
        footer={
          <>
            <Button variant="outline" onClick={() => setSelectedDeal(null)}>Fechar</Button>
            <Button onClick={handleMove} loading={moveDeal.isPending} disabled={targetStage === selectedDeal?.stageId}>
              Mover estágio
            </Button>
          </>
        }
      >
        {selectedDeal && (
          <div className="space-y-4 text-sm">
            <p><strong>Contato:</strong> {selectedDeal.contact}</p>
            <p><strong>Valor:</strong> {formatCurrency(selectedDeal.value)}</p>
            <div className="flex items-center gap-2">
              <strong>Canal:</strong> <ChannelBadge channel={selectedDeal.channel} />
            </div>
            <Select
              label="Mover para estágio"
              options={(stages ?? []).map((s) => ({ value: s.id, label: s.name }))}
              value={targetStage}
              onChange={(e) => setTargetStage(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
