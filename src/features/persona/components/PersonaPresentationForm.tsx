import { TextareaField } from '@/features/persona/components/PersonaFormPrimitives';
import type { AgentPersona } from '@/features/persona/types';

export function PersonaPresentationForm({
  value,
  onChange,
  disabled,
}: {
  value: AgentPersona;
  onChange: (value: AgentPersona) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextareaField label="Saudação inicial" value={value.greeting} onChange={(greeting) => onChange({ ...value, greeting })} disabled={disabled} />
      <TextareaField label="Apresentação do agente" value={value.introduction ?? ''} onChange={(introduction) => onChange({ ...value, introduction })} disabled={disabled} />
      <TextareaField label="Forma de chamar o cliente" value={value.customerAddressing ?? ''} onChange={(customerAddressing) => onChange({ ...value, customerAddressing })} disabled={disabled} />
      <TextareaField label="Encerramento padrão" value={value.defaultClosing ?? ''} onChange={(defaultClosing) => onChange({ ...value, defaultClosing })} disabled={disabled} />
    </div>
  );
}
