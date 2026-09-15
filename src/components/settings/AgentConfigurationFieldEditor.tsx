import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { AgentConfigurationField, AgentConfigurationValue } from '@/services/agentConfiguration.service';
import { cn } from '@/utils';

interface Props {
  field: AgentConfigurationField;
  value: AgentConfigurationValue;
  disabled: boolean;
  changed: boolean;
  error?: string;
  onChange: (key: string, value: AgentConfigurationValue) => void;
}

export function AgentConfigurationFieldEditor({ field, value, disabled, changed, error, onChange }: Props) {
  const id = `configuration-${field.key}`;
  const locked = disabled || Boolean(field.readOnly);
  const describedBy = `${id}-description${error ? ` ${id}-error` : ''}`;
  const numeric = field.type === 'integer' || field.type === 'number';

  return (
    <div className={cn('min-w-0 space-y-2 rounded-xl border p-4',
      changed ? 'border-primary-300 bg-primary-50/30 dark:border-primary-600 dark:bg-primary-950/20' : 'border-gray-200 dark:border-slate-700',
      field.type === 'textarea' && 'md:col-span-2')}>
      {(changed || field.readOnly) && (
        <div className="flex gap-2">
          {changed && <Badge variant="primary">Alterado</Badge>}
          {field.readOnly && <Badge variant="default">Somente leitura</Badge>}
        </div>
      )}
      {field.type === 'boolean' ? (
        <label htmlFor={id} className="flex items-start justify-between gap-4 text-sm font-medium text-gray-700 dark:text-gray-300">
          {field.label}
          <input id={id} type="checkbox" checked={Boolean(value)} disabled={locked}
            aria-describedby={describedBy}
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-blue-600 disabled:cursor-not-allowed"
            onChange={(event) => onChange(field.key, event.target.checked)} />
        </label>
      ) : field.type === 'select' ? (
        <Select id={id} label={field.label} options={field.options ?? []} value={String(value ?? '')}
          disabled={locked} aria-describedby={describedBy} aria-invalid={Boolean(error)}
          onChange={(event) => onChange(field.key, event.target.value)} />
      ) : field.type === 'textarea' ? (
        <div>
          <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
          <textarea id={id} rows={field.valueSchema ? 8 : 4} maxLength={field.maxLength} disabled={locked}
            aria-describedby={describedBy} aria-invalid={Boolean(error)}
            className={cn('w-full resize-y rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50', field.valueSchema && 'font-mono')}
            value={String(value ?? '')} onChange={(event) => onChange(field.key, event.target.value)} />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {String(value ?? '').length.toLocaleString('pt-BR')}{field.maxLength ? ` / ${field.maxLength.toLocaleString('pt-BR')}` : ''} caracteres
          </p>
        </div>
      ) : (
        <Input id={id} label={field.label} type={numeric ? 'number' : 'text'}
          min={field.min} max={field.max} step={field.step ?? (field.type === 'integer' ? 1 : 'any')}
          maxLength={field.maxLength} value={typeof value === 'boolean' ? String(value) : value ?? ''} disabled={locked}
          aria-describedby={describedBy} aria-invalid={Boolean(error)}
          onChange={(event) => onChange(field.key, numeric && event.target.value !== '' ? Number(event.target.value) : event.target.value)} />
      )}
      <p id={`${id}-description`} className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{field.description}</p>
      {numeric && (field.min !== undefined || field.max !== undefined) && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {field.min !== undefined ? `Mínimo: ${field.min}. ` : ''}{field.max !== undefined ? `Máximo: ${field.max}.` : ''}
        </p>
      )}
      {!!field.variables?.length && <p className="break-words text-xs text-primary-700 dark:text-primary-300">Preserve as variáveis: {field.variables.map((name) => `{${name}}`).join(', ')}</p>}
      {field.valueSchema && <p className="text-xs text-gray-500 dark:text-gray-400">Preserve a estrutura da lista JSON ao editar.</p>}
      {error && <p id={`${id}-error`} role="alert" className="text-sm text-red-600 dark:text-red-300">{error}</p>}
      <details className="text-xs text-gray-500 dark:text-gray-400">
        <summary className="cursor-pointer py-1">Referência do campo</summary>
        <p className="mt-1 break-all font-mono">{field.key}</p>
        {field.default !== undefined && (
          <div className="mt-2">
            <p className="font-medium">Valor padrão do catálogo</p>
            <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-words font-sans">{typeof field.default === 'boolean' ? (field.default ? 'Ativado' : 'Desativado') : String(field.default)}</pre>
          </div>
        )}
      </details>
    </div>
  );
}
