import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StructuredConfigurationEditor } from './StructuredConfigurationEditor';
import { getConfigurationGuidance } from '@/features/agent-configuration/configurationGuidance';
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
  const [rawMode, setRawMode] = useState(false);
  const id = `configuration-${field.key}`;
  const locked = disabled || Boolean(field.readOnly);
  const describedBy = `${id}-description ${id}-when${error ? ` ${id}-error` : ''}`;
  const numeric = field.type === 'integer' || field.type === 'number';
  const guidance = getConfigurationGuidance(field);
  const label = guidance.label;
  let validJson = true;
  if (field.valueSchema) { try { validJson = Array.isArray(JSON.parse(String(value))); } catch { validJson = false; } }
  const structured = Boolean(field.valueSchema) && !rawMode && validJson;

  return <article aria-labelledby={`${id}-title`} className={cn('min-w-0 rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900 sm:p-7',
    changed ? 'border-primary-400 dark:border-primary-500' : 'border-gray-200 dark:border-slate-700')}>
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 id={`${id}-title`} className="text-base font-semibold leading-7 text-gray-900 dark:text-white">{label}</h3>
        <div className="flex gap-2">{changed && <Badge variant="primary">Alterado</Badge>}{field.readOnly && <Badge variant="default">Somente leitura</Badge>}</div>
      </div>
      <p id={`${id}-description`} className="max-w-4xl text-sm leading-7 text-gray-600 dark:text-gray-300">{guidance.purpose}</p>
      <div id={`${id}-when`} className="rounded-xl bg-blue-50/70 px-4 py-3 text-sm leading-6 text-blue-950 dark:bg-blue-950/30 dark:text-blue-200">
        <span className="font-semibold">Quando é usada: </span>{guidance.whenUsed}
      </div>
    </div>
    <div className="space-y-3 border-t border-gray-100 pt-5 dark:border-slate-800">
      {field.type === 'boolean' ? <label htmlFor={id} className="flex w-fit items-center gap-3 text-sm font-medium">
        <input id={id} type="checkbox" checked={Boolean(value)} disabled={locked} aria-describedby={describedBy}
          aria-label={label} className="h-5 w-5 rounded accent-blue-600 disabled:cursor-not-allowed" onChange={(event) => onChange(field.key, event.target.checked)} />
        {value ? 'Ativado' : 'Desativado'}
      </label> : field.type === 'select' ? <Select id={id} label="Valor configurado" options={field.options ?? []} value={String(value ?? '')}
        className="max-w-xl" disabled={locked} aria-label={label} aria-describedby={describedBy} aria-invalid={Boolean(error)} onChange={(event) => onChange(field.key, event.target.value)} />
      : field.type === 'textarea' ? <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3"><label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.target === 'message' ? 'Conteúdo configurado' : 'Valor configurado'}</label>
          {field.valueSchema && <button type="button" className="text-xs font-medium text-primary-600 dark:text-primary-300" aria-pressed={rawMode || !validJson}
            onClick={() => setRawMode((current) => !current)}>{rawMode ? 'Usar formulário' : 'Editar JSON'}</button>}</div>
        {structured ? <StructuredConfigurationEditor id={id} schema={field.valueSchema!} value={String(value)} disabled={locked} onChange={(next) => onChange(field.key, next)} />
          : <textarea id={id} rows={field.valueSchema ? 10 : 5} maxLength={field.maxLength} disabled={locked}
            aria-label={label} aria-describedby={describedBy} aria-invalid={Boolean(error)}
            className={cn('w-full resize-y rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm leading-7 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-50', field.valueSchema && 'font-mono')}
            value={String(value ?? '')} onChange={(event) => onChange(field.key, event.target.value)} />}
        <p className="text-xs text-gray-500 dark:text-gray-400">{String(value ?? '').length.toLocaleString('pt-BR')}{field.maxLength ? ` / ${field.maxLength.toLocaleString('pt-BR')}` : ''} caracteres</p>
      </div> : <Input id={id} label="Valor configurado" aria-label={label} className="max-w-xl" type={numeric ? 'number' : 'text'}
        min={field.min} max={field.max} step={field.step ?? (field.type === 'integer' ? 1 : 'any')} maxLength={field.maxLength}
        value={typeof value === 'boolean' ? String(value) : value ?? ''} disabled={locked} aria-describedby={describedBy} aria-invalid={Boolean(error)}
        onChange={(event) => onChange(field.key, numeric && event.target.value !== '' ? Number(event.target.value) : event.target.value)} />}
      {numeric && (field.min !== undefined || field.max !== undefined) && <p className="text-xs text-gray-500 dark:text-gray-400">{field.min !== undefined ? `Mínimo: ${field.min}. ` : ''}{field.max !== undefined ? `Máximo: ${field.max}.` : ''}</p>}
      {!!field.variables?.length && <p className="break-words text-xs leading-6 text-primary-700 dark:text-primary-300">Preenchidas pelo agente; preserve estas variáveis: {field.variables.map((name) => `{${name}}`).join(', ')}</p>}
      {error && <p id={`${id}-error`} role="alert" className="text-sm text-red-600 dark:text-red-300">{error}</p>}
    </div>
    <details className="mt-5 border-t border-gray-100 pt-4 text-xs leading-6 text-gray-500 dark:border-slate-800 dark:text-gray-400">
      <summary className="cursor-pointer font-medium">Referência técnica e valor padrão</summary>
      <p className="mt-3 break-all font-mono">{field.key}</p><p className="mt-2">{field.description}</p>
      {field.default !== undefined && <div className="mt-3"><p className="font-medium">Valor padrão do catálogo</p>
        <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words font-sans">{typeof field.default === 'boolean' ? (field.default ? 'Ativado' : 'Desativado') : String(field.default)}</pre></div>}
    </details>
  </article>;
}
