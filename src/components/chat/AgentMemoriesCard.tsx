import type { AgentContactMemory } from '@/types';
import { Brain } from 'lucide-react';

interface AgentMemoriesCardProps {
  memories: AgentContactMemory[];
}

export function AgentMemoriesCard({ memories }: AgentMemoriesCardProps) {
  const active = memories.filter((m) => !m.status || m.status === 'active').slice(0, 5);

  return (
    <section className="rounded-xl border border-gray-200/80 bg-white/70 p-3 dark:border-white/10 dark:bg-gray-900/40">
      <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-gray-600 dark:text-gray-300">
        <Brain className="h-3.5 w-3.5" /> Memórias
      </p>

      {active.length === 0 ? (
        <p className="mt-2 text-xs text-gray-500">Nenhuma memória ativa neste contato.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {active.map((memory) => (
            <li key={memory.id} className="rounded-lg bg-gray-50 px-2 py-1.5 dark:bg-gray-800/60">
              <p className="text-xs text-gray-800 dark:text-gray-200">
                {memory.safeSummary || memory.memoryKey || 'Memória sem resumo'}
              </p>
              {memory.memoryKind && (
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">
                  {memory.memoryKind}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
