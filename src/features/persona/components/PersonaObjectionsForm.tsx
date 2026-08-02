import { ListEditor, TextareaField, compactList } from '@/features/persona/components/PersonaFormPrimitives';
import type { AgentPersona } from '@/features/persona/types';

const defaultObjections = ['Preço', 'Prazo', 'Confiança', 'Comparação', 'Necessidade de aprovação', 'Indisponibilidade'];

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
            value={value.objectionHandling.find((item) => item.startsWith(`${objection}:`))?.replace(`${objection}:`, '').trim() ?? ''}
            onChange={(text) => {
              const otherItems = value.objectionHandling.filter((item) => !item.startsWith(`${objection}:`));
              onChange({ ...value, objectionHandling: compactList([...otherItems, `${objection}: ${text}`]) });
            }}
            disabled={disabled}
            rows={2}
          />
        ))}
      </div>
      <ListEditor label="Objeções personalizadas" values={value.customObjections ?? []} onChange={(customObjections) => onChange({ ...value, customObjections: compactList(customObjections) })} disabled={disabled} />
    </div>
  );
}
