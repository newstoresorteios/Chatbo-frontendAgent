import { Badge } from '@/components/ui/Badge';
import { formatCents, formatDateTime } from '@/utils';
import type { AgentPixPayment } from '@/types';
import { QrCode } from 'lucide-react';

interface AgentPixCardProps {
  payments: AgentPixPayment[];
}

function pixVariant(status?: string | null): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  const normalized = (status || '').toLowerCase();
  if (['approved', 'paid', 'accredited'].includes(normalized)) return 'success';
  if (['pending', 'in_process', 'waiting'].includes(normalized)) return 'warning';
  if (['cancelled', 'canceled', 'rejected', 'expired'].includes(normalized)) return 'danger';
  return 'info';
}

function pixLabel(status?: string | null): string {
  const normalized = (status || '').toLowerCase();
  const map: Record<string, string> = {
    pending: 'Pendente',
    approved: 'Pago',
    paid: 'Pago',
    accredited: 'Pago',
    cancelled: 'Cancelado',
    canceled: 'Cancelado',
    rejected: 'Rejeitado',
    expired: 'Expirado',
    in_process: 'Processando',
  };
  return map[normalized] ?? (status || '—');
}

export function AgentPixCard({ payments }: AgentPixCardProps) {
  const latest = payments[0];

  return (
    <section className="rounded-xl border border-gray-200/80 bg-white/70 p-3 dark:border-white/10 dark:bg-gray-900/40">
      <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-gray-600 dark:text-gray-300">
        <QrCode className="h-3.5 w-3.5" /> PIX
      </p>

      {!latest ? (
        <p className="mt-2 text-xs text-gray-500">Nenhum pagamento PIX registrado.</p>
      ) : (
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCents(latest.amountCents, latest.currency || 'BRL')}
            </p>
            <Badge variant={pixVariant(latest.status)} className="text-[10px]">
              {pixLabel(latest.status)}
            </Badge>
          </div>
          {latest.description && (
            <p className="text-xs text-gray-600 dark:text-gray-300">{latest.description}</p>
          )}
          {latest.paidAt ? (
            <p className="text-[11px] text-gray-500">Pago em {formatDateTime(latest.paidAt)}</p>
          ) : latest.expiresAt ? (
            <p className="text-[11px] text-gray-500">Expira em {formatDateTime(latest.expiresAt)}</p>
          ) : null}
        </div>
      )}
    </section>
  );
}
