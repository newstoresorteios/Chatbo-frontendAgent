import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/utils';
import type { AgentRecentResponse } from '@/types';
import { Bot } from 'lucide-react';

interface AgentRecentDecisionsCardProps {
  responses: AgentRecentResponse[];
}

export function AgentRecentDecisionsCard({ responses }: AgentRecentDecisionsCardProps) {
  const items = responses.slice(0, 3);

  return (
    <section className="rounded-xl border border-gray-200/80 bg-white/70 p-3 dark:border-white/10 dark:bg-gray-900/40">
      <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-gray-600 dark:text-gray-300">
        <Bot className="h-3.5 w-3.5" /> Últimas decisões IA
      </p>

      {items.length === 0 ? (
        <p className="mt-2 text-xs text-gray-500">Sem respostas recentes do agente.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.map((response) => (
            <li key={response.id} className="rounded-lg bg-gray-50 px-2 py-1.5 dark:bg-gray-800/60">
              <div className="mb-1 flex flex-wrap items-center gap-1">
                {response.intent && (
                  <Badge variant="info" className="text-[10px]">
                    {response.intent}
                  </Badge>
                )}
                {response.handoffRequired && (
                  <Badge variant="warning" className="text-[10px]">
                    Handoff
                  </Badge>
                )}
                {!response.providerSendOk && (
                  <Badge variant="danger" className="text-[10px]">
                    Falha envio
                  </Badge>
                )}
                {response.createdAt && (
                  <span className="ml-auto text-[10px] text-gray-400">
                    {formatRelativeTime(response.createdAt)}
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-xs text-gray-700 dark:text-gray-300">
                {response.replyText}
              </p>
              {response.safetyReason && (
                <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                  Safety: {response.safetyReason}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
