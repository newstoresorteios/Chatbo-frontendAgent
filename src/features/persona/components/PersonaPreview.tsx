import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { toneLabel } from '@/features/persona/components/PersonaToneForm';
import type { AgentPersona } from '@/features/persona/types';

function display(value?: string) {
  return value?.trim() ? value : 'Não configurado';
}

export function PersonaPreview({ persona }: { persona: AgentPersona }) {
  const firstGoal = persona.salesGoals.find(Boolean) ?? persona.commercialPriorities?.find(Boolean);
  const approach = persona.greeting || persona.introduction || 'Não configurado';

  return (
    <Card title="Pré-visualização do rascunho" subtitle="Esta visão usa apenas o estado atual do formulário.">
      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-400">Agente</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{display(persona.name)}</p>
          </div>
          <Badge variant="warning">Rascunho</Badge>
        </div>
        <dl className="space-y-3">
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-400">Função</dt>
            <dd className="text-gray-700 dark:text-gray-200">{display(persona.role)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-400">Tom</dt>
            <dd className="text-gray-700 dark:text-gray-200">{toneLabel(persona.tone)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-400">Saudação</dt>
            <dd className="text-gray-700 dark:text-gray-200">{display(persona.greeting)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-400">Público</dt>
            <dd className="text-gray-700 dark:text-gray-200">{display(persona.targetAudience)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-400">Objetivo principal</dt>
            <dd className="text-gray-700 dark:text-gray-200">{display(firstGoal)}</dd>
          </div>
        </dl>
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
          <p className="text-xs font-semibold uppercase text-gray-400">Exemplo de abordagem</p>
          <p className="mt-1 text-gray-700 dark:text-gray-200">{approach}</p>
        </div>
      </div>
    </Card>
  );
}
