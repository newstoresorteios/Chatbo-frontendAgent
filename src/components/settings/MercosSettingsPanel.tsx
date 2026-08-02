import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/Card';
import { DemoNotice } from '@/components/ui/DemoNotice';
import { Loading } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { usePermissions } from '@/hooks/usePermissions';
import { useNotification } from '@/contexts/NotificationContext';
import { useMercosHomologacao, useMercosLogs, useMercosStatus } from '@/hooks/useQueries';
import { mercosService, type MercosSyncType } from '@/services/mercos.service';
import { formatCurrency, formatDateTime } from '@/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, ClipboardCheck, Package, RefreshCw, ShoppingCart, Users, XCircle } from 'lucide-react';
import { useState } from 'react';

export function MercosSettingsPanel() {
  const { can } = usePermissions();
  const canSync = can('manageIntegrations');
  const { data: status, isLoading } = useMercosStatus();
  const { data: logs } = useMercosLogs();
  const { data: homologacao, isFetching: loadingHomolog, refetch: refetchHomolog } = useMercosHomologacao(canSync);
  const { addToast } = useNotification();
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState<MercosSyncType | null>(null);
  const [confirmProdSync, setConfirmProdSync] = useState(false);

  const isProduction = Boolean(status?.isProduction ?? status?.environment === 'production');
  const isSandbox = !isProduction;

  const testMutation = useMutation({
    mutationFn: () => mercosService.testConnection(),
    onSuccess: (result) => {
      addToast({
        title: result.ok ? 'Conexão OK' : 'Falha na conexão',
        message: result.message,
        type: result.ok ? 'success' : 'error',
      });
      queryClient.invalidateQueries({ queryKey: ['mercos'] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Não foi possível conectar ao Mercos';
      addToast({ title: 'Falha na conexão', message: String(message), type: 'error' });
    },
  });

  const syncMutation = useMutation({
    mutationFn: ({ type, confirmProduction }: { type: MercosSyncType; confirmProduction?: boolean }) =>
      mercosService.sync(type, { confirmProduction }),
    onMutate: ({ type }) => setSyncing(type),
    onSuccess: (result) => {
      addToast({ title: 'Sincronização concluída', message: result.message, type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['mercos'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['funnel'] });
      queryClient.invalidateQueries({ queryKey: ['sales-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Falha na sincronização';
      addToast({ title: 'Erro', message: typeof message === 'string' ? message : 'Falha na sincronização', type: 'error' });
    },
    onSettled: () => setSyncing(null),
  });

  const handleSync = (type: MercosSyncType) => {
    if (isProduction && type === 'all') {
      setConfirmProdSync(true);
      return;
    }
    syncMutation.mutate({ type });
  };

  const confirmProductionSync = () => {
    setConfirmProdSync(false);
    syncMutation.mutate({ type: 'all', confirmProduction: true });
  };

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      {isSandbox && <DemoNotice variant="sandbox" />}

      {!canSync && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          Somente supervisores e administradores podem sincronizar dados do Mercos.
        </p>
      )}

      {isProduction ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-100">
          <p className="font-medium">Mercos PRODUÇÃO</p>
          <p className="mt-1">
            API: <strong>{status?.baseUrlHost ?? 'api.mercos.com'}</strong> — dados reais do cliente.
            Sincronizar <strong>Tudo</strong> exige confirmação.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-100">
          <p className="font-medium">Etapa 6 — Migrar para produção</p>
          <p className="mt-1">Quando o cliente liberar os tokens, altere no Render:</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-blue-800 dark:text-blue-200/90">
            <li><code>MERCOS_BASE_URL=https://api.mercos.com/api/v1</code></li>
            <li><code>MERCOS_APPLICATION_TOKEN</code> e <code>MERCOS_COMPANY_TOKEN</code> de produção</li>
            <li><code>MERCOS_ENV=production</code> (opcional)</li>
          </ul>
          <p className="mt-2 text-xs">Ambiente atual: <strong>{status?.environment ?? 'sandbox'}</strong> ({status?.baseUrlHost ?? 'sandbox.mercos.com'})</p>
        </div>
      )}

      {isSandbox && (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        <p className="font-medium">Pedidos permanentes (Etapa 4)</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-amber-800 dark:text-amber-200/90">
          <li>No sandbox Mercos, abra <strong>Pedidos</strong> e marque alguns como <strong>Enviado</strong> ou <strong>Entregue</strong>.</li>
          <li>Volte aqui e clique em <strong>Sincronizar Pedidos</strong> (ou Tudo).</li>
          <li>O funil e Relatórios passam a usar esses status — re-sync não apaga dados do Mercos.</li>
        </ol>
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-300/80">
          Evite o script <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">demo_pedidos_status.py</code> — ele só patcha o Supabase e é sobrescrito no próximo sync.
        </p>
      </div>
      )}

      {status?.allOrdersProcessing && (status.syncedOrders ?? 0) > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-950/20">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
          <div className="text-sm text-orange-900 dark:text-orange-100">
            <p className="font-medium">Todos os pedidos estão em Processando</p>
            <p className="mt-1 text-orange-800 dark:text-orange-200/90">
              Relatórios e receita retida ficam zerados até você alterar status no Mercos{isSandbox ? ' sandbox' : ''} e sincronizar de novo.
            </p>
          </div>
        </div>
      )}

      {(status?.orderStatusBreakdown?.length ?? 0) > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Status dos pedidos (Supabase)</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {status?.orderStatusBreakdown?.map((item) => (
              <div
                key={item.code}
                className="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{item.count}</p>
                <p className="text-xs text-gray-500">{formatCurrency(item.value)}</p>
              </div>
            ))}
          </div>
          {(status?.retainedRevenue ?? 0) > 0 && (
            <p className="mt-3 text-sm text-green-700 dark:text-green-400">
              Receita retida (enviado + entregue): <strong>{formatCurrency(status?.retainedRevenue ?? 0)}</strong>
            </p>
          )}
        </div>
      )}

      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-400">
        <p className="font-medium text-gray-900 dark:text-gray-200">Tokens configurados no servidor</p>
        <p className="mt-1">
          Application Token, Company Token e URL da API ficam no backend (Render → Environment). Esta tela
          testa e sincroniza com as credenciais já deployadas — não é possível alterar tokens pelo navegador.
        </p>
      </div>

      {canSync && (
        <div className="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex gap-3">
              <ClipboardCheck className="mt-0.5 h-6 w-6 shrink-0 text-teal-600" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Homologação Mercos (API)</p>
                <p className="mt-1 text-sm text-gray-500">
                  Probe das rotas exigidas na ata (clientes, produtos, tabelas, condições, etc.).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {homologacao ? (
                <Badge variant={homologacao.prontoParaHomologacao ? 'success' : 'danger'}>
                  {homologacao.prontoParaHomologacao ? 'Pronto' : 'Pendente'}
                </Badge>
              ) : (
                <Badge variant="default">—</Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchHomolog()}
                loading={loadingHomolog}
              >
                <RefreshCw className="h-4 w-4" />
                Verificar
              </Button>
            </div>
          </div>
          {homologacao && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">APIs de leitura</p>
                <ul className="space-y-1 text-sm">
                  {Object.entries(homologacao.apisLeitura ?? {}).map(([nome, ok]) => (
                    <li key={nome} className="flex items-center justify-between gap-2">
                      <span className="text-gray-700 dark:text-gray-300">{nome}</span>
                      <span className={ok ? 'text-green-600' : 'text-red-500'}>
                        {ok ? `OK${homologacao.contagens?.[nome] != null ? ` (${homologacao.contagens[nome]})` : ''}` : 'Falha'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Critérios</p>
                <ul className="space-y-1 text-sm">
                  {Object.entries(homologacao.criteriosObrigatorios ?? {}).map(([nome, ok]) => (
                    <li key={nome} className="flex items-center justify-between gap-2">
                      <span className="text-gray-700 dark:text-gray-300">{nome}</span>
                      <span className={ok ? 'text-green-600' : 'text-red-500'}>{ok ? 'OK' : 'Falta'}</span>
                    </li>
                  ))}
                </ul>
                {Object.keys(homologacao.erros ?? {}).length > 0 && (
                  <p className="mt-3 text-xs text-red-600">
                    Erros: {Object.entries(homologacao.erros ?? {}).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-100 p-4 dark:border-gray-800">
        {status?.connected ? (
          <>
            <CheckCircle className="h-8 w-8 shrink-0 text-green-500" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-green-600 dark:text-green-400">Mercos configurado</p>
              <p className="text-sm text-gray-500">
                Última verificação: {status.lastSync ? formatDateTime(status.lastSync) : '—'}
              </p>
            </div>
            <Badge variant="success">Conectada</Badge>
            {isProduction ? (
              <Badge variant="danger">Produção</Badge>
            ) : (
              <Badge variant="info">Sandbox</Badge>
            )}
          </>
        ) : (
          <>
            <XCircle className="h-8 w-8 shrink-0 text-red-500" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-red-600">Mercos não configurado</p>
              <p className="text-sm text-gray-500">Defina MERCOS_* no Render e faça redeploy</p>
            </div>
            <Badge variant="danger">Desconectada</Badge>
          </>
        )}
        <Button
          variant="outline"
          onClick={() => testMutation.mutate()}
          loading={testMutation.isPending}
          disabled={!status?.connected}
        >
          Testar conexão
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Produtos sincronizados" value={status?.syncedProducts ?? 0} icon={Package} variant="primary" />
        <StatCard title="Clientes sincronizados" value={status?.syncedCustomers ?? 0} icon={Users} variant="success" />
        <StatCard title="Pedidos sincronizados" value={status?.syncedOrders ?? 0} icon={ShoppingCart} />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Sincronização</p>
        <div className="flex flex-wrap gap-3">
          {(['all', 'customers', 'products', 'orders'] as MercosSyncType[]).map((type) => {
            const labels = { products: 'Produtos', customers: 'Clientes', orders: 'Pedidos', all: 'Tudo' };
            return (
              <Button
                key={type}
                onClick={() => handleSync(type)}
                loading={syncing === type}
                disabled={!!syncing || !status?.connected || !canSync}
              >
                <RefreshCw className="h-4 w-4" />
                Sincronizar {labels[type]}
              </Button>
            );
          })}
        </div>
      </div>

      {(logs ?? []).length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Logs recentes</p>
          <div className="space-y-2">
            {logs?.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={log.status === 'success' ? 'success' : log.status === 'error' ? 'danger' : 'info'}>
                    {log.type}
                  </Badge>
                  <span className="text-sm">{log.message}</span>
                </div>
                <span className="shrink-0 text-xs text-gray-400">{formatDateTime(log.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={confirmProdSync}
        onClose={() => setConfirmProdSync(false)}
        title="Sincronizar produção?"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmProdSync(false)}>Cancelar</Button>
            <Button onClick={confirmProductionSync} loading={syncMutation.isPending}>
              Confirmar sync completo
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Você está conectado ao Mercos <strong>PRODUÇÃO</strong>. Isso vai importar clientes, produtos e
          pedidos reais do cliente para o Supabase. Deseja continuar?
        </p>
      </Modal>
    </div>
  );
}
