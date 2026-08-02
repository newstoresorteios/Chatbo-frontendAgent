import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { AgentPersona, PersonaStatus } from '@/features/persona/types';

interface PersonaFormProps {
  value: AgentPersona;
  onChange: (value: AgentPersona) => void;
  disabled?: boolean;
}

export function PersonaIdentityForm({ value, onChange, disabled }: PersonaFormProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="Nome da persona" value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} disabled={disabled} />
      <Input label="Função" value={value.role} onChange={(event) => onChange({ ...value, role: event.target.value })} disabled={disabled} />
      <Input label="Segmento" value={value.segment} onChange={(event) => onChange({ ...value, segment: event.target.value })} disabled={disabled} />
      <Input label="Idioma" value={value.language ?? ''} onChange={(event) => onChange({ ...value, language: event.target.value })} disabled={disabled} />
      <Select
        label="Status"
        value={value.status}
        onChange={(event) => onChange({ ...value, status: event.target.value as PersonaStatus })}
        disabled={disabled}
        options={[
          { value: 'draft', label: 'Rascunho' },
          { value: 'active', label: 'Ativa' },
          { value: 'inactive', label: 'Inativa' },
        ]}
      />
    </div>
  );
}
