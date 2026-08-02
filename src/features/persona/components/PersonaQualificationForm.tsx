import { ListEditor, compactList } from '@/features/persona/components/PersonaFormPrimitives';
import type { AgentPersona } from '@/features/persona/types';

export function PersonaQualificationForm({
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
      <ListEditor label="Perguntas obrigatórias" values={value.requiredQuestions ?? []} onChange={(requiredQuestions) => onChange({ ...value, requiredQuestions: compactList(requiredQuestions) })} disabled={disabled} />
      <ListEditor label="Informações que o agente deve descobrir" values={value.discoveryFields ?? []} onChange={(discoveryFields) => onChange({ ...value, discoveryFields: compactList(discoveryFields) })} disabled={disabled} />
      <ListEditor label="Critérios para identificar oportunidade" values={value.opportunityCriteria ?? []} onChange={(opportunityCriteria) => onChange({ ...value, opportunityCriteria: compactList(opportunityCriteria), qualificationRules: compactList(opportunityCriteria) })} disabled={disabled} />
      <ListEditor label="Critérios para encaminhar ao vendedor" values={value.sellerHandoffCriteria ?? []} onChange={(sellerHandoffCriteria) => onChange({ ...value, sellerHandoffCriteria: compactList(sellerHandoffCriteria) })} disabled={disabled} />
    </div>
  );
}
