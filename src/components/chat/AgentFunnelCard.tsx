import { Badge } from '@/components/ui/Badge';
import { agentLifecycleLabels, agentStageLabels, formatDateTime } from '@/utils';
import type { AgentConversationStatus, AgentRemarketingContact } from '@/types';
import { ExternalLink, Target } from 'lucide-react';

interface AgentFunnelCardProps {
  status?: AgentConversationStatus | null;
  contact?: AgentRemarketingContact | null;
}

function stageVariant(
  stage?: string | null,
): 'default' | 'primary' | 'info' | 'warning' | 'success' | 'danger' {
  switch (stage) {
    case 'awaiting_payment':
      return 'warning';
    case 'checkout':
    case 'cart':
      return 'info';
    case 'product_selection':
      return 'primary';
    default:
      return 'default';
  }
}

export function AgentFunnelCard({ status, contact }: AgentFunnelCardProps) {
  if (!status && !contact) {
    return (
      <section className="rounded-xl border border-gray-200/80 bg-white/70 p-3 dark:border-white/10 dark:bg-gray-900/40">
        <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
          <Target className="h-3.5 w-3.5" /> Funil do agente
        </p>
        <p className="mt-2 text-xs text-gray-500">Sem status de funil AI para este contato.</p>
      </section>
    );
  }

  const stageLabel = status?.stage
    ? agentStageLabels[status.stage] ?? status.stage
    : '—';
  const lifecycleLabel = status?.status
    ? agentLifecycleLabels[status.status] ?? status.status
    : null;

  return (
    <section className="rounded-xl border border-gray-200/80 bg-white/70 p-3 dark:border-white/10 dark:bg-gray-900/40">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-gray-600 dark:text-gray-300">
          <Target className="h-3.5 w-3.5" /> Funil do agente
        </p>
        <div className="flex flex-wrap justify-end gap-1">
          {lifecycleLabel && (
            <Badge variant={status?.status === 'active' ? 'success' : 'default'} className="text-[10px]">
              {lifecycleLabel}
            </Badge>
          )}
          {status?.stage && (
            <Badge variant={stageVariant(status.stage)} className="text-[10px]">
              {stageLabel}
            </Badge>
          )}
        </div>
      </div>

      {status?.productName && (
        <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{status.productName}</p>
      )}

      <div className="mt-2 space-y-1 text-xs text-gray-500">
        {status?.orderId && <p>Pedido: {status.orderId}</p>}
        {status?.nextScheduledAt && (
          <p>Próxima ação: {formatDateTime(status.nextScheduledAt)}</p>
        )}
        {status?.completionReason && <p>Motivo: {status.completionReason}</p>}
        {contact?.marketingStatus === 'opted_out' && (
          <p className="text-amber-600 dark:text-amber-400">Contato opt-out de remarketing</p>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-1">
        {status?.cartUrl && (
          <a
            href={status.cartUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-300"
          >
            <ExternalLink className="h-3 w-3" /> Abrir carrinho
          </a>
        )}
        {status?.paymentUrl && (
          <a
            href={status.paymentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-300"
          >
            <ExternalLink className="h-3 w-3" /> Link de pagamento
          </a>
        )}
      </div>
    </section>
  );
}
