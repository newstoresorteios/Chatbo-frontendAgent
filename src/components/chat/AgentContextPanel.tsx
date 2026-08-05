import { AgentFunnelCard } from '@/components/chat/AgentFunnelCard';
import { AgentMemoriesCard } from '@/components/chat/AgentMemoriesCard';
import { AgentPixCard } from '@/components/chat/AgentPixCard';
import { AgentRecentDecisionsCard } from '@/components/chat/AgentRecentDecisionsCard';
import { Loading } from '@/components/ui/EmptyState';
import type { ConversationAgentContext } from '@/types';
import { cn } from '@/utils';

interface AgentContextPanelProps {
  context?: ConversationAgentContext | null;
  isLoading?: boolean;
  isError?: boolean;
  /** stack = coluna lateral; grid = faixa abaixo do chat */
  layout?: 'stack' | 'grid';
  className?: string;
}

export function AgentContextPanel({
  context,
  isLoading,
  isError,
  layout = 'stack',
  className,
}: AgentContextPanelProps) {
  if (isLoading && !context) {
    return (
      <div className={cn(layout === 'stack' ? 'mt-4' : '', className)}>
        <Loading className="py-6" text="Carregando dados do agente..." />
      </div>
    );
  }

  if (isError && !context) {
    return (
      <div
        className={cn(
          'rounded-xl border border-amber-200/80 bg-amber-50/80 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200',
          layout === 'stack' && 'mt-4',
          className,
        )}
      >
        Dados do agente indisponíveis no momento.
      </div>
    );
  }

  const data = context ?? {
    conversationId: '',
    memories: [],
    pixPayments: [],
    recentResponses: [],
  };

  return (
    <div
      className={cn(
        layout === 'grid'
          ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-4'
          : 'mt-4 space-y-3',
        className,
      )}
    >
      <AgentFunnelCard status={data.status} contact={data.contact} />
      <AgentMemoriesCard memories={data.memories} />
      <AgentPixCard payments={data.pixPayments} />
      <AgentRecentDecisionsCard responses={data.recentResponses} />
    </div>
  );
}
