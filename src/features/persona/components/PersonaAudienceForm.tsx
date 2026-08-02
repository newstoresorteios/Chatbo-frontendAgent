import { ListEditor, TextareaField, compactList } from '@/features/persona/components/PersonaFormPrimitives';
import type { AgentPersona } from '@/features/persona/types';

export function PersonaAudienceForm({
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
      <TextareaField label="Público-alvo" value={value.targetAudience} onChange={(targetAudience) => onChange({ ...value, targetAudience })} disabled={disabled} />
      <TextareaField label="Tipo de cliente" value={value.customerType ?? ''} onChange={(customerType) => onChange({ ...value, customerType })} disabled={disabled} />
      <ListEditor label="Objetivos de venda" values={value.salesGoals} onChange={(salesGoals) => onChange({ ...value, salesGoals: compactList(salesGoals) })} disabled={disabled} />
      <ListEditor label="Prioridades comerciais" values={value.commercialPriorities ?? []} onChange={(commercialPriorities) => onChange({ ...value, commercialPriorities: compactList(commercialPriorities) })} disabled={disabled} />
    </div>
  );
}
