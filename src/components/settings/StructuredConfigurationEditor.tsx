import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus, Trash2 } from 'lucide-react';

type Knowledge = { title: string; body: string; cues: string[]; policyKey?: string | null; [key: string]: unknown };
const textClass = 'w-full rounded-lg border border-gray-300 bg-white p-3 text-sm leading-6 text-gray-900 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100';

export function StructuredConfigurationEditor({ id, schema, value, disabled, onChange }: {
  id: string; schema: string; value: string; disabled: boolean; onChange: (value: string) => void;
}) {
  let items: unknown[];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return null;
    items = parsed;
  } catch { return null; }
  const save = (next: unknown[]) => onChange(JSON.stringify(next));
  const update = (index: number, next: unknown) => save(items.map((item, i) => i === index ? next : item));
  const remove = (index: number) => save(items.filter((_, i) => i !== index));
  const removeButton = (index: number) => <Button type="button" variant="ghost" disabled={disabled || items.length <= 1}
    aria-label={`Remover item ${index + 1}`} onClick={() => remove(index)}><Trash2 className="h-4 w-4" />Remover</Button>;

  if (schema === 'creditBands' && items.every((item) => Array.isArray(item) && item.length === 3 && item.every((n) => n === null || typeof n === 'number'))) {
    return <div id={id} className="space-y-5">
      <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">Para cada faixa de saldo, informe o valor que a compra precisa superar. Ex.: de R$ 50 a R$ 250 em crédito, compra acima de R$ 1.500.</p>
      {(items as Array<Array<number | null>>).map((band, index) => <div key={index} className="space-y-4 rounded-xl bg-gray-50 p-4 dark:bg-slate-800/50">
        <div className="flex items-center justify-between gap-2"><h4 className="text-sm font-semibold">Faixa {index + 1}</h4>{removeButton(index)}</div>
        <div className="grid gap-4 md:grid-cols-3">{['Crédito de (R$)', 'Crédito até (R$)', 'Compra acima de (R$)'].map((label, column) => <Input
          key={column} label={label} id={`${id}-${index}-${column}`} type="number" min="0.01" step="0.01" disabled={disabled}
          value={band[column] === null ? '' : band[column] / 100}
          onChange={(event) => update(index, band.map((n, i) => i === column ? (event.target.value === '' ? null : Math.round(Number(event.target.value) * 100)) : n))} />)}</div>
      </div>)}
      <Button type="button" variant="outline" disabled={disabled || items.length >= 100} onClick={() => save([...items, [null, null, null]])}><Plus className="h-4 w-4" />Adicionar faixa</Button>
    </div>;
  }
  if (schema === 'greetingVariants' && items.every((item) => typeof item === 'string')) {
    return <div id={id} className="space-y-5">{(items as string[]).map((item, index) => <div key={index} className="space-y-2">
      <div className="flex items-center justify-between"><label htmlFor={`${id}-${index}`} className="text-sm font-semibold">Saudação {index + 1}</label>{removeButton(index)}</div>
      <textarea id={`${id}-${index}`} rows={3} maxLength={1000} className={textClass} value={item} disabled={disabled} onChange={(event) => update(index, event.target.value)} />
    </div>)}<Button type="button" variant="outline" disabled={disabled || items.length >= 100} onClick={() => save([...items, ''])}><Plus className="h-4 w-4" />Adicionar saudação</Button></div>;
  }
  if (schema === 'institutionalKnowledge' && items.every((item) => item && typeof item === 'object' && !Array.isArray(item)
    && typeof (item as Knowledge).title === 'string' && typeof (item as Knowledge).body === 'string'
    && Array.isArray((item as Knowledge).cues) && (item as Knowledge).cues.every((cue) => typeof cue === 'string'))) {
    return <div id={id} className="space-y-6">{(items as Knowledge[]).map((item, index) => <div key={index} className="space-y-5 rounded-xl border border-gray-200 p-4 dark:border-slate-700 sm:p-5">
      <div className="flex items-center justify-between"><h4 className="text-sm font-semibold">Assunto {index + 1}</h4>{removeButton(index)}</div>
      <Input id={`${id}-${index}-title`} label="Nome do assunto" value={item.title} disabled={disabled} onChange={(event) => update(index, { ...item, title: event.target.value })} />
      <div><label htmlFor={`${id}-${index}-body`} className="mb-2 block text-sm font-medium">Informação oficial que o agente pode usar</label>
        <textarea id={`${id}-${index}-body`} rows={5} className={textClass} value={item.body} disabled={disabled} onChange={(event) => update(index, { ...item, body: event.target.value })} /></div>
      <div className="grid items-start gap-5 lg:grid-cols-2"><div>
        <label htmlFor={`${id}-${index}-cues`} className="mb-2 block text-sm font-medium">Termos que acionam a consulta</label>
        <textarea id={`${id}-${index}-cues`} rows={4} className={textClass} value={item.cues.join('\n')} disabled={disabled} onChange={(event) => update(index, { ...item, cues: event.target.value.split('\n') })} />
        <p className="mt-2 text-xs text-gray-500">Um termo por linha. Ex.: garantia, certificado, original.</p>
      </div><Select id={`${id}-${index}-policy`} label="Usar este assunto quando" disabled={disabled} value={item.policyKey || ''}
        options={[{ value: '', label: 'O assunto for relevante' }, { value: 'acceptsTradeIn', label: 'A política de permuta estiver ativa' }]}
        onChange={(event) => update(index, { ...item, policyKey: event.target.value || null })} /></div>
    </div>)}<Button type="button" variant="outline" disabled={disabled || items.length >= 100} onClick={() => save([...items, { title: '', body: '', cues: [], policyKey: null }])}><Plus className="h-4 w-4" />Adicionar assunto</Button></div>;
  }
  return <p role="alert" className="text-sm text-amber-700 dark:text-amber-300">A estrutura deste valor precisa ser corrigida no modo JSON antes de usar o formulário.</p>;
}
