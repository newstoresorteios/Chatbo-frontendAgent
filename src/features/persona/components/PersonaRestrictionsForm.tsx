import { ListEditor, compactList } from '@/features/persona/components/PersonaFormPrimitives';
import type { AgentPersona } from '@/features/persona/types';

export function PersonaRestrictionsForm({
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
      <ListEditor label="Assuntos proibidos" values={value.forbiddenSubjects ?? []} onChange={(forbiddenSubjects) => onChange({ ...value, forbiddenSubjects: compactList(forbiddenSubjects) })} disabled={disabled} />
      <ListEditor label="Promessas que não pode fazer" values={value.forbiddenPromises ?? []} onChange={(forbiddenPromises) => onChange({ ...value, forbiddenPromises: compactList(forbiddenPromises) })} disabled={disabled} />
      <ListEditor label="Informações que não pode inventar" values={value.nonInventableInformation ?? []} onChange={(nonInventableInformation) => onChange({ ...value, nonInventableInformation: compactList(nonInventableInformation), restrictions: compactList(nonInventableInformation) })} disabled={disabled} />
      <ListEditor label="Condições comerciais que exigem humano" values={value.humanOnlyCommercialTerms ?? []} onChange={(humanOnlyCommercialTerms) => onChange({ ...value, humanOnlyCommercialTerms: compactList(humanOnlyCommercialTerms) })} disabled={disabled} />
    </div>
  );
}
