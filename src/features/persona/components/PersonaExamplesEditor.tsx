import { Button } from '@/components/ui/Button';
import { TextareaField } from '@/features/persona/components/PersonaFormPrimitives';
import type { PersonaExample } from '@/features/persona/types';
import { Plus, Trash2 } from 'lucide-react';

export function PersonaExamplesEditor({
  value,
  onChange,
  disabled,
}: {
  value: PersonaExample[];
  onChange: (value: PersonaExample[]) => void;
  disabled?: boolean;
}) {
  const examples = value.length > 0 ? value : [{ customerMessage: '', expectedResponse: '' }];
  const update = (index: number, patch: Partial<PersonaExample>) => {
    onChange(examples.map((example, itemIndex) => (itemIndex === index ? { ...example, ...patch } : example)));
  };

  return (
    <div className="space-y-4">
      {examples.map((example, index) => (
        <div key={example.id ?? index} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Exemplo {index + 1}</p>
            <Button type="button" size="icon" variant="ghost" onClick={() => onChange(examples.filter((_, itemIndex) => itemIndex !== index))} disabled={disabled || examples.length === 0} title="Remover exemplo">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <TextareaField label="Cliente" value={example.customerMessage} onChange={(customerMessage) => update(index, { customerMessage })} disabled={disabled} placeholder="Mensagem do cliente" />
            <TextareaField label="Resposta esperada" value={example.expectedResponse} onChange={(expectedResponse) => update(index, { expectedResponse })} disabled={disabled} placeholder="Como a persona deveria responder" />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => onChange([...examples, { customerMessage: '', expectedResponse: '' }])} disabled={disabled}>
        <Plus className="h-4 w-4" /> Adicionar exemplo
      </Button>
    </div>
  );
}
