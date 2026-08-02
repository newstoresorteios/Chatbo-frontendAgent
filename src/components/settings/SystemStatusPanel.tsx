import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Loading } from '@/components/ui/EmptyState';
import { useNotification } from '@/contexts/NotificationContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useSystemStatus } from '@/hooks/useQueries';
import { systemService } from '@/services/system.service';
import { formatDateTime } from '@/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Database,
  Link,
  MessageCircle,
  RefreshCw,
  Server,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StatusRow({
  ok,
  label,
  detail,
  actionLabel,
  onAction,
}: {
  ok: boolean;
  label: string;
  detail: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-4 dark:border-gray-800">
      <div className="flex gap-3">
        {ok ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        )}
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="mt-1 text-sm text-gray-500">{detail}</p>
        </div>
      </div>
      {!ok && actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function SystemStatusPanel() {
  const { data, isLoading, isFetching, refetch } = useSystemStatus();
  const workspace = useWorkspace();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDemo, setConfirmDemo] = useState(false);
  const [confirmMercos, setConfirmMercos] = useState(false);

  const clearDemoMutation = useMutation({
    mutationFn: (incluirMercos: boolean) => systemService.clearDemo(incluirMercos),
    onSuccess: (result) => {
      addToast({ title: 'Limpeza concluída', message: result.message, type: 'success' });
      setConfirmDemo(false);
      setConfirmMercos(false);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['chatbots'] });
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['funnel'] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Não foi possível limpar os dados de demonstração';
      addToast({ title: 'Erro', message: String(message), type: 'error' });
    },
  });

  const goToTab = (tab: string) => {
    navigate(`/configuracoes?tab=${tab}`);
  };

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['mercos'] });
    queryClient.invalidateQueries({ queryKey: ['whatsapp'] });
    queryClient.invalidateQueries({ queryKey: ['agent'] });
  };

  if (isLoading || !data) return <Loading />;

  const { supabase, mercos, whatsapp, openai, data: stats, readiness } = data;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 dark:border-blue-900/40 dark:from-blue-950/30 dark:to-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Prontidão para produção</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {readiness.completed}/{readiness.total} etapas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={readiness.percent >= 80 ? 'success' : readiness.percent >= 40 ? 'warning' : 'default'}>
              {readiness.percent}% pronto
            </Badge>
            <Button variant="outline" size="sm" onClick={handleRefresh} loading={isFetching}>
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-red-500 transition-all"
            style={{ width: `${readiness.percent}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <StatusRow
          ok={supabase.ok}
          label="Supabase"
          detail={
            supabase.ok
              ? `${supabase.message}${supabase.users != null ? ` · ${supabase.users} usuário(s)` : ''}`
              : supabase.error ?? supabase.message
          }
        />

        <StatusRow
          ok={mercos.configured}
          label="Mercos"
          detail={
            mercos.configured
              ? `${mercos.isProduction ? 'Produção' : 'Sandbox'} · ${mercos.syncedCustomers} clientes · ${mercos.syncedOrders} pedidos${
                  mercos.lastSync ? ` · última sync ${formatDateTime(mercos.lastSync)}` : ''
                }`
              : 'Defina MERCOS_APPLICATION_TOKEN, MERCOS_COMPANY_TOKEN e MERCOS_BASE_URL no Render'
          }
          actionLabel="Configurar"
          onAction={() => goToTab('mercos')}
        />

        <StatusRow
          ok={whatsapp.connected}
          label="WhatsApp (Meta)"
          detail={
            whatsapp.connected
              ? `Conectado${whatsapp.displayPhone ? ` · ${whatsapp.displayPhone}` : ''}`
              : whatsapp.message ?? 'Configure META_ACCESS_TOKEN e META_PHONE_NUMBER_ID no Render'
          }
          actionLabel="Configurar"
          onAction={() => goToTab('whatsapp')}
        />

        <StatusRow
          ok={openai.configured}
          label="OpenAI (IA)"
          detail={
            openai.configured
              ? `${openai.model ?? 'GPT'} · modo ${openai.mode}`
              : 'Defina OPENAI_API_KEY no Render para robô e copiloto com GPT'
          }
          actionLabel="Ver detalhes"
          onAction={() => goToTab('openai')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Database className="h-4 w-4" />
            Clientes c/ telefone
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.customersWithPhone}</p>
          <p className="text-xs text-gray-500">Para campanhas WhatsApp</p>
        </div>
        <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link className="h-4 w-4" />
            Produtos sync
          </div>
          <p className="mt-2 text-2xl font-bold">{mercos.syncedProducts}</p>
        </div>
        <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MessageCircle className="h-4 w-4" />
            Webhook WhatsApp
          </div>
          <p className="mt-2 truncate text-xs font-mono text-gray-600 dark:text-gray-400">
            {whatsapp.webhookUrl ?? '—'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300">
        <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
          <Sparkles className="h-4 w-4 text-blue-500" />
          Variáveis no Render (backend)
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
          <li>Mercos: <code>MERCOS_APPLICATION_TOKEN</code>, <code>MERCOS_COMPANY_TOKEN</code>, <code>MERCOS_BASE_URL</code></li>
          <li>WhatsApp: <code>META_ACCESS_TOKEN</code>, <code>META_PHONE_NUMBER_ID</code></li>
          <li>IA: <code>OPENAI_API_KEY</code></li>
          <li>Banco: <code>SUPABASE_URL</code>, <code>SUPABASE_KEY</code></li>
        </ul>
      </div>

      {workspace.accountType === 'system_admin' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
          <p className="flex items-center gap-2 font-medium text-amber-900 dark:text-amber-100">
            <Trash2 className="h-4 w-4" />
            Preparar ambiente só Mercos
          </p>
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-200/90">
            Remove conversas demo, campanhas fictícias, canais/robôs do seed e integrações fake.
            Depois sincronize o Mercos para carregar dados reais do cliente.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setConfirmDemo(true)}>
              Limpar demonstração
            </Button>
            <Button variant="outline" onClick={() => setConfirmMercos(true)}>
              Limpar demo + dados Mercos
            </Button>
            <Button variant="outline" onClick={() => goToTab('mercos')}>
              Ir para Mercos
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmDemo}
        onClose={() => setConfirmDemo(false)}
        onConfirm={() => clearDemoMutation.mutate(false)}
        title="Limpar dados de demonstração?"
        message="Remove conversas Carlos/Mariana, campanhas Black Friday, canais fake e métricas inventadas do robô. Usuários e configurações são mantidos."
        confirmLabel="Limpar demo"
        loading={clearDemoMutation.isPending}
        variant="danger"
      />

      <ConfirmModal
        open={confirmMercos}
        onClose={() => setConfirmMercos(false)}
        onConfirm={() => clearDemoMutation.mutate(true)}
        title="Limpar demo e dados Mercos?"
        message="Além da demonstração, apaga clientes, produtos e pedidos no Supabase. Use antes de sincronizar uma conta Mercos nova."
        confirmLabel="Limpar tudo"
        loading={clearDemoMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
