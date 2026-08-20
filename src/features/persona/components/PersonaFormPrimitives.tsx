import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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

type ListRow = { id: number; value: string };

function filledKey(values: string[]): string {
  return values.map((item) => item.trim()).filter(Boolean).join('\n');
}

function toRows(values: string[], startId: number): ListRow[] {
  const source = values.length > 0 ? values : [''];
  return source.map((value, index) => ({ id: startId + index, value }));
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
  const idRef = useRef(1);
  const [rows, setRows] = useState<ListRow[]>(() => toRows(values, 1));
  const parentKey = filledKey(values);

  useEffect(() => {
    setRows((current) => {
      if (filledKey(current.map((row) => row.value)) === parentKey && current.length >= Math.max(values.length, 1)) {
        return current;
      }
      idRef.current += Math.max(values.length, 1) + 1;
      return toRows(values, idRef.current);
    });
  }, [parentKey, values]);

  const commit = (updater: (current: ListRow[]) => ListRow[]) => {
    setRows((current) => {
      const next = updater(current);
      const normalized = next.length > 0 ? next : [{ id: ++idRef.current, value: '' }];
      onChange(normalized.map((row) => row.value));
      return normalized;
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            commit((current) => [...current, { id: ++idRef.current, value: '' }]);
          }}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex gap-2">
            <Input
              value={row.value}
              onChange={(event) => {
                const nextValue = event.target.value;
                commit((current) =>
                  current.map((item) => (item.id === row.id ? { ...item, value: nextValue } : item)),
                );
              }}
              placeholder={placeholder}
              disabled={disabled}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={(event) => {
                event.preventDefault();
                commit((current) => current.filter((item) => item.id !== row.id));
              }}
              disabled={disabled || (rows.length === 1 && !rows[0]?.value)}
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
