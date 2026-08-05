import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, Loading } from '@/components/ui/EmptyState';
import { useNotification } from '@/contexts/NotificationContext';
import {
  agentLearningKeys,
  agentLearningService,
  type LearningExtension,
  type LearningInsight,
} from '@/services/agentLearning.service';
import { extractApiErrorMessage } from '@/utils/apiErrors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BookOpenCheck,
  CheckCircle2,
  GraduationCap,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react';

function formatDate(value?: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function formatPct(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${Math.round(Number(value) * 100)}%`;
}

function categoryLabel(category: string): string {
  const map: Record<string, string> = {
    persona: 'Persona',
    knowledge: 'Conhecimento',
    retrieval: 'Busca',
    handoff: 'Transferência',
    greeting: 'Saudação',
    policy: 'Política',
    other: 'Outro',
  };
  return map[category] || category;
}

function InsightCard({
  insight,
  promoting,
  rejecting,
  onPromote,
  onReject,
}: {
  insight: LearningInsight;
  promoting: boolean;
  rejecting: boolean;
  onPromote: () => void;
  onReject: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="warning">Pendente</Badge>
            <Badge variant="default">{categoryLabel(insight.category)}</Badge>
          </div>
          <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
            {insight.title}
          </h3>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>Evidências: {insight.evidenceCount}</p>
          <p>Confiança: {formatPct(insight.confidence)}</p>
          <p>Importância: {formatPct(insight.importance)}</p>
        </div>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        {insight.insightText}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
        <p className="text-xs text-gray-500">Criado em {formatDate(insight.createdAt)}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            loading={rejecting}
            disabled={promoting || rejecting}
            onClick={onReject}
          >
            <XCircle className="h-4 w-4" />
            Rejeitar
          </Button>
          <Button size="sm" loading={promoting} disabled={promoting || rejecting} onClick={onPromote}>
            <CheckCircle2 className="h-4 w-4" />
            Autorizar e promover
          </Button>
        </div>
      </div>
    </div>
  );
}

function ExtensionCard({
  extension,
  tone,
  actionLabel,
  loading,
  onAction,
  onReject,
  rejecting,
}: {
  extension: LearningExtension;
  tone: 'pending' | 'active';
  actionLabel?: string;
  loading?: boolean;
  onAction?: () => void;
  onReject?: () => void;
  rejecting?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant={tone === 'active' ? 'success' : 'warning'}>
          {tone === 'active' ? 'Ativa na persona' : 'Aguardando aprovação'}
        </Badge>
        <Badge variant="default">{categoryLabel(extension.category)}</Badge>
      </div>
      <p className="mb-2 text-xs text-gray-500">{extension.extensionKey}</p>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        {extension.instructionText}
      </p>
      {(onAction || onReject) && (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
          {onReject ? (
            <Button variant="outline" size="sm" loading={rejecting} disabled={loading || rejecting} onClick={onReject}>
              <XCircle className="h-4 w-4" />
              Rejeitar
            </Button>
          ) : null}
          {onAction ? (
            <Button size="sm" loading={loading} disabled={loading || rejecting} onClick={onAction}>
              <BookOpenCheck className="h-4 w-4" />
              {actionLabel || 'Aprovar'}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function AgentLearningPage() {
  const queryClient = useQueryClient();
  const { addToast } = useNotification();

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: agentLearningKeys.overview(),
    queryFn: agentLearningService.overview,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: agentLearningKeys.all });
  };

  const promoteMutation = useMutation({
    mutationFn: (insightId: number) => agentLearningService.promoteInsight(insightId, true),
    onSuccess: async () => {
      addToast({
        title: 'Aprendizado promovido',
        message: 'A instrução foi autorizada e ativada na persona do agente.',
        type: 'success',
      });
      await invalidate();
    },
    onError: (err) => {
      addToast({
        title: 'Falha ao promover',
        message: extractApiErrorMessage(err, 'Não foi possível autorizar o aprendizado.'),
        type: 'error',
      });
    },
  });

  const rejectInsightMutation = useMutation({
    mutationFn: (insightId: number) => agentLearningService.rejectInsight(insightId),
    onSuccess: async () => {
      addToast({ title: 'Insight rejeitado', message: 'O aprendizado foi descartado.', type: 'success' });
      await invalidate();
    },
    onError: (err) => {
      addToast({
        title: 'Falha ao rejeitar',
        message: extractApiErrorMessage(err, 'Não foi possível rejeitar o insight.'),
        type: 'error',
      });
    },
  });

  const approveExtMutation = useMutation({
    mutationFn: (extensionId: number) => agentLearningService.approveExtension(extensionId),
    onSuccess: async () => {
      addToast({
        title: 'Extensão ativada',
        message: 'A instrução passou a valer na persona do agente.',
        type: 'success',
      });
      await invalidate();
    },
    onError: (err) => {
      addToast({
        title: 'Falha ao aprovar',
        message: extractApiErrorMessage(err, 'Não foi possível ativar a extensão.'),
        type: 'error',
      });
    },
  });

  const rejectExtMutation = useMutation({
    mutationFn: (extensionId: number) => agentLearningService.rejectExtension(extensionId),
    onSuccess: async () => {
      addToast({ title: 'Extensão rejeitada', message: 'A proposta foi descartada.', type: 'success' });
      await invalidate();
    },
    onError: (err) => {
      addToast({
        title: 'Falha ao rejeitar',
        message: extractApiErrorMessage(err, 'Não foi possível rejeitar a extensão.'),
        type: 'error',
      });
    },
  });

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Não foi possível carregar o aprendizado"
        description={extractApiErrorMessage(error, 'Verifique a conexão com o backend.')}
        action={
          <Button onClick={() => void refetch()}>
            <RefreshCw className="h-4 w-4" />
            Tentar de novo
          </Button>
        }
      />
    );
  }

  const pendingInsights = data?.pendingInsights ?? [];
  const pendingExtensions = data?.pendingExtensions ?? [];
  const activeExtensions = data?.activeExtensions ?? [];
  const counts = data?.counts;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            <GraduationCap className="h-3.5 w-3.5" />
            Gate humano · auto-promote desligado
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Aprendizado do agente
          </h1>
          <p className="mt-1 max-w-2xl text-gray-500 dark:text-gray-400">
            Revise insights gerados pelos atendimentos e autorize a promoção para a persona.
            Com <code className="text-xs">AGENT_LEARNING_AUTO_PROMOTE=false</code> e{' '}
            <code className="text-xs">AGENT_LEARNING_AUTO_ACTIVATE=false</code>, nada entra na
            persona sem esta aprovação.
          </p>
        </div>
        <Button variant="outline" loading={isFetching} onClick={() => void refetch()}>
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <p className="text-xs uppercase tracking-wide text-amber-800 dark:text-amber-200">Insights pendentes</p>
          <p className="mt-1 font-display text-3xl font-semibold text-amber-950 dark:text-amber-100">
            {counts?.pendingInsights ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
          <p className="text-xs uppercase tracking-wide text-sky-800 dark:text-sky-200">Extensões aguardando</p>
          <p className="mt-1 font-display text-3xl font-semibold text-sky-950 dark:text-sky-100">
            {counts?.pendingExtensions ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <p className="text-xs uppercase tracking-wide text-emerald-800 dark:text-emerald-200">Ativas na persona</p>
          <p className="mt-1 font-display text-3xl font-semibold text-emerald-950 dark:text-emerald-100">
            {counts?.activeExtensions ?? 0}
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
            Insights para autorizar
          </h2>
        </div>
        {pendingInsights.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="Nenhum aprendizado pendente"
            description="Quando o cron de attendance-learning gerar insights, eles aparecem aqui para autorização."
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {pendingInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                promoting={promoteMutation.isPending && promoteMutation.variables === insight.id}
                rejecting={rejectInsightMutation.isPending && rejectInsightMutation.variables === insight.id}
                onPromote={() => promoteMutation.mutate(insight.id)}
                onReject={() => rejectInsightMutation.mutate(insight.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="h-5 w-5 text-sky-500" />
          <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
            Extensões aguardando aprovação
          </h2>
        </div>
        {pendingExtensions.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma extensão pendente no momento.</p>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {pendingExtensions.map((extension) => (
              <ExtensionCard
                key={extension.id}
                extension={extension}
                tone="pending"
                actionLabel="Ativar na persona"
                loading={approveExtMutation.isPending && approveExtMutation.variables === extension.id}
                rejecting={rejectExtMutation.isPending && rejectExtMutation.variables === extension.id}
                onAction={() => approveExtMutation.mutate(extension.id)}
                onReject={() => rejectExtMutation.mutate(extension.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
            Instruções ativas na persona
          </h2>
        </div>
        {activeExtensions.length === 0 ? (
          <p className="text-sm text-gray-500">Ainda não há extensões ativas promovidas pelo aprendizado.</p>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {activeExtensions.map((extension) => (
              <ExtensionCard key={extension.id} extension={extension} tone="active" />
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
