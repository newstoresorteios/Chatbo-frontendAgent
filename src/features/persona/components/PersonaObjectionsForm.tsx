import { ListEditor, TextareaField } from '@/features/persona/components/PersonaFormPrimitives';
import type { AgentPersona } from '@/features/persona/types';

const defaultObjections = ['Preço', 'Prazo', 'Confiança', 'Comparação', 'Necessidade de aprovação', 'Indisponibilidade'];

function objectionDraft(items: string[], objection: string): string {
  const prefix = `${objection}:`;
  const raw = items.find((item) => item.startsWith(prefix));
  if (!raw) return '';
  return raw.slice(prefix.length).replace(/^\s/, '');
}

export function PersonaObjectionsForm({
  value,
  onChange,
  disabled,
}: {
  value: AgentPersona;
  onChange: (value: AgentPersona) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-2">
        {defaultObjections.map((objection) => (
          <TextareaField
            key={objection}
            label={objection}
            value={objectionDraft(value.objectionHandling, objection)}
            onChange={(text) => {
              const otherItems = value.objectionHandling.filter((item) => !item.startsWith(`${objection}:`));
              onChange({ ...value, objectionHandling: [...otherItems, `${objection}: ${text}`] });
            }}
            disabled={disabled}
            rows={2}
          />
        ))}
      </div>
      <ListEditor label="Objeções personalizadas" values={value.customObjections ?? []} onChange={(customObjections) => onChange({ ...value, customObjections })} disabled={disabled} />
    </div>
  );
}
