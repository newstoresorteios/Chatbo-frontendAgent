import { ListEditor, compactList } from '@/features/persona/components/PersonaFormPrimitives';
import type { AgentPersona } from '@/features/persona/types';

const transferTriggers = [
  'Pedido explícito do cliente',
  'Risco de conflito',
  'Negociação especial',
  'Dúvida sem informação confiável',
  'Falha de integração',
  'Cliente de alta prioridade',
];

export function PersonaEscalationForm({
  value,
  onChange,
  disabled,
}: {
  value: AgentPersona;
  onChange: (value: AgentPersona) => void;
  disabled?: boolean;
}) {
  const triggers = value.humanTransferTriggers ?? [];
  const toggle = (trigger: string, checked: boolean) => {
    const humanTransferTriggers = checked ? [...triggers, trigger] : triggers.filter((item) => item !== trigger);
    onChange({ ...value, humanTransferTriggers, escalationRules: humanTransferTriggers });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-2">
        {transferTriggers.map((trigger) => (
          <label key={trigger} className="flex min-h-11 items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200">
            <input type="checkbox" checked={triggers.includes(trigger)} onChange={(event) => toggle(trigger, event.target.checked)} disabled={disabled} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span>{trigger}</span>
          </label>
        ))}
      </div>
      <ListEditor label="Regras adicionais de transferência" values={value.escalationRules.filter((item) => !transferTriggers.includes(item))} onChange={(rules) => onChange({ ...value, escalationRules: [...triggers, ...compactList(rules)] })} disabled={disabled} />
    </div>
  );
}
