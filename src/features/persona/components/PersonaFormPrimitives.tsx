import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils';
import { Plus, Trash2 } from 'lucide-react';

export function TextareaField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
}) {
  const id = label.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      />
    </div>
  );
}

export function ListEditor({
  label,
  values,
  onChange,
  disabled,
  placeholder = 'Adicionar item',
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const visibleValues = values.length > 0 ? values : [''];
  const update = (index: number, nextValue: string) => {
    onChange(visibleValues.map((item, itemIndex) => (itemIndex === index ? nextValue : item)));
  };

  const add = () => onChange([...visibleValues, '']);
  const remove = (index: number) => onChange(visibleValues.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        <Button type="button" size="sm" variant="outline" onClick={add} disabled={disabled}>
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>
      <div className="space-y-2">
        {visibleValues.map((item, index) => (
          <div key={`${label}-${index}`} className="flex gap-2">
            <Input
              value={item}
              onChange={(event) => update(index, event.target.value)}
              placeholder={placeholder}
              disabled={disabled}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => remove(index)}
              disabled={disabled || (visibleValues.length === 1 && !visibleValues[0])}
              title="Remover"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function compactList(values: string[]): string[] {
  return values.map((item) => item.trim()).filter(Boolean);
}
