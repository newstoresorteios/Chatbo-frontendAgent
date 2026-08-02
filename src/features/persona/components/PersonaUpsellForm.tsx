import { Input } from '@/components/ui/Input';
import { ListEditor, TextareaField, compactList } from '@/features/persona/components/PersonaFormPrimitives';
import type { AgentPersona } from '@/features/persona/types';

export function PersonaUpsellForm({
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
      <TextareaField label="Quando sugerir produto complementar" value={(value.complementaryProductRules ?? []).join('\n')} onChange={(text) => onChange({ ...value, complementaryProductRules: compactList(text.split('\n')) })} disabled={disabled} />
      <TextareaField label="Quando sugerir opção superior" value={(value.premiumOptionRules ?? []).join('\n')} onChange={(text) => onChange({ ...value, premiumOptionRules: compactList(text.split('\n')) })} disabled={disabled} />
      <Input label="Limite de insistência" value={value.insistenceLimit ?? ''} onChange={(event) => onChange({ ...value, insistenceLimit: event.target.value })} disabled={disabled} />
      <ListEditor label="Regras de recomendação" values={value.recommendationRules ?? []} onChange={(recommendationRules) => onChange({ ...value, recommendationRules: compactList(recommendationRules), upsellRules: compactList(recommendationRules) })} disabled={disabled} />
    </div>
  );
}
