import { TextareaField } from '@/features/persona/components/PersonaFormPrimitives';
import type { AgentPersona, PersonaTone } from '@/features/persona/types';
import { cn } from '@/utils';

const toneOptions: Array<{ value: PersonaTone; label: string }> = [
  { value: 'professional', label: 'Profissional' },
  { value: 'consultative', label: 'Consultivo' },
  { value: 'objective', label: 'Objetivo' },
  { value: 'friendly', label: 'Amigável' },
  { value: 'sophisticated', label: 'Sofisticado' },
  { value: 'technical', label: 'Técnico' },
  { value: 'informal', label: 'Informal' },
  { value: 'custom', label: 'Personalizado' },
];

export function toneLabel(tone: PersonaTone) {
  return toneOptions.find((option) => option.value === tone)?.label ?? 'Profissional';
}

export function PersonaToneForm({
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
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {toneOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange({ ...value, tone: option.value })}
            disabled={disabled}
            className={cn(
              'min-h-11 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition',
              value.tone === option.value
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-200'
                : 'border-gray-200 text-gray-600 hover:border-primary-300 dark:border-gray-700 dark:text-gray-300',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <TextareaField
        label="Detalhes adicionais do tom"
        value={value.customToneDetails ?? ''}
        onChange={(customToneDetails) => onChange({ ...value, customToneDetails })}
        disabled={disabled}
        placeholder="Descreva limites, expressões preferidas ou nuances do tom."
      />
    </div>
  );
}
