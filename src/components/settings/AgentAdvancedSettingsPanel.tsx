import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useNotification } from '@/contexts/NotificationContext';
import {
  agentConfigurationService,
  type AgentConfigurationField,
  type AgentConfigurationValue,
} from '@/services/agentConfiguration.service';
import { formatDateTime } from '@/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, History, Save, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';

const configurationKey = ['agent', 'configuration'] as const;

function errorDetail(error: unknown): string {
  return String(
    (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      ?? 'Não foi possível salvar a configuração.',
  );
}

export function AgentAdvancedSettingsPanel() {
  const queryClient = useQueryClient();
  const { addToast } = useNotification();
  const [draft, setDraft] = useState<{ version: number; values: Record<string, AgentConfigurationValue> } | null>(null);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('Políticas comerciais');
  const [showHistory, setShowHistory] = useState(false);

  const configuration = useQuery({
    queryKey: configurationKey,
    queryFn: agentConfigurationService.get,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const history = useQuery({
    queryKey: [...configurationKey, 'history'],
    queryFn: agentConfigurationService.history,
    enabled: showHistory,
  });

  const values = draft?.values ?? configuration.data?.values ?? {};
  const setValues = (update: (current: Record<string, AgentConfigurationValue>) => Record<string, AgentConfigurationValue>) =>
    setDraft((current) => ({ version: current?.version ?? configuration.data?.version ?? 0,
      values: update(current?.values ?? configuration.data?.values ?? {}) }));

  const publish = useMutation({
    mutationFn: () => agentConfigurationService.publish(draft?.version ?? configuration.data?.version ?? 0, values),
    onSuccess: (next) => {
      queryClient.setQueryData(configurationKey, next);
      setDraft(null);
      queryClient.invalidateQueries({ queryKey: [...configurationKey, 'history'] });
      addToast({
        title: `Configuração v${next.version} publicada`,
        message: 'O NSAgent aplicará os novos valores nos próximos atendimentos.',
        type: 'success',
      });
    },
    onError: (error) => addToast({ title: 'Falha ao publicar', message: errorDetail(error), type: 'error' }),
  });

  const fields = configuration.data?.fields;
  const groups = useMemo(() => {
    const grouped = new Map<string, AgentConfigurationField[]>();
    for (const field of fields ?? []) {
      const query = search.trim().toLocaleLowerCase('pt-BR');
      if (query ? ![field.label, field.description, field.key].join(' ').toLocaleLowerCase('pt-BR').includes(query)
        : groupFilter && field.group !== groupFilter) continue;
      grouped.set(field.group, [...(grouped.get(field.group) ?? []), field]);
    }
    return [...grouped.entries()];
  }, [fields, search, groupFilter]);

  const dirty = Boolean(draft) && Boolean(configuration.data)
    && JSON.stringify(values) !== JSON.stringify(configuration.data?.values);

  if (configuration.isLoading) return <Loading />;

  if (configuration.isError || !configuration.data) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Configuração avançada indisponível</p>
          <p className="mt-1">{errorDetail(configuration.error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900 dark:bg-cyan-950/20 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <SlidersHorizontal className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700 dark:text-cyan-300" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Configuração operacional publicada</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Apenas controles validados são exibidos. Chaves, tokens e parâmetros de infraestrutura permanecem protegidos.
            </p>
          </div>
        </div>
        <Badge variant="primary">versão {configuration.data.version}</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Buscar configuração ou mensagem" value={search} onChange={(event) => setSearch(event.target.value)}
          placeholder="Ex.: PIX, permuta, chamadas, saudação" />
        <Select label="Categoria" value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)}
          options={[{ value: '', label: 'Todas as categorias' }, ...[...new Set(fields?.map((field) => field.group) ?? [])]
            .map((group) => ({ value: group, label: group }))]} />
      </div>
      {draft && draft.version !== configuration.data.version && (
        <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Outra versão foi publicada. Seu rascunho está preservado; descarte ou compare as alterações antes de publicar novamente.
        </p>
      )}
      {!groups.length && <p className="text-sm text-slate-500">Nenhum campo encontrado.</p>}
      {groups.map(([group, fields]) => (
        <section key={group} className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">{group}</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                {field.type === 'boolean' ? (
                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{field.label}</span>
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      checked={Boolean(values[field.key])}
                      disabled={field.readOnly || publish.isPending}
                      onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.checked }))}
                    />
                  </label>
                ) : field.type === 'select' ? (
                  <Select
                    label={field.label}
                    options={field.options ?? []}
                    value={String(values[field.key] ?? '')}
                    disabled={field.readOnly || publish.isPending}
                    onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
                  />
                ) : field.type === 'textarea' ? (
                  <label className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                    {field.label}
                    <textarea rows={6} maxLength={field.maxLength}
                      disabled={field.readOnly || publish.isPending}
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-transparent p-3 text-sm font-normal dark:border-slate-600"
                      value={String(values[field.key] ?? '')}
                      onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} />
                    <span className="text-xs font-normal text-slate-500">{String(values[field.key] ?? '').length} caracteres</span>
                  </label>
                ) : field.type === 'text' ? (
                  <Input label={field.label} maxLength={field.maxLength}
                    disabled={field.readOnly || publish.isPending}
                    value={String(values[field.key] ?? '')}
                    onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} />
                ) : (
                  <Input
                    label={field.label}
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={Number(values[field.key] ?? 0)}
                    disabled={field.readOnly || publish.isPending}
                    onChange={(event) => setValues((current) => ({ ...current, [field.key]: Number(event.target.value) }))}
                  />
                )}
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{field.description}</p>
                {!!field.variables?.length && <p className="mt-2 text-xs text-cyan-700 dark:text-cyan-300">Variáveis obrigatórias: {field.variables.map((name) => `{${name}}`).join(', ')}</p>}
                {field.valueSchema && <p className="mt-2 text-xs text-slate-500">Formato JSON: preserve a estrutura da lista ao editar.</p>}
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
        <Button variant="outline" disabled={!dirty || publish.isPending} onClick={() => setDraft(null)}>
          Descartar
        </Button>
        <Button loading={publish.isPending} disabled={!dirty || (draft !== null && draft.version !== configuration.data.version)} onClick={() => publish.mutate()}>
          <Save className="h-4 w-4" />
          Publicar nova versão
        </Button>
      </div>

      <section className="space-y-3 border-t border-slate-200 pt-5 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-slate-500" />
          <h4 className="font-semibold text-slate-900 dark:text-white">Histórico de publicação</h4>
          <Button variant="outline" onClick={() => setShowHistory((current) => !current)}>
            {showHistory ? 'Ocultar' : 'Carregar histórico'}
          </Button>
        </div>
        {showHistory && history.isLoading && <p className="text-sm text-slate-500">Carregando histórico…</p>}
        {showHistory && history.isError && <p role="alert" className="text-sm text-red-600">{errorDetail(history.error)}</p>}
        {showHistory && !history.isLoading && !history.isError && (history.data?.length ? (
          <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
            {history.data.slice(0, 8).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <span className="font-medium text-slate-800 dark:text-slate-100">Versão {item.version}</span>
                <span className="text-slate-500 dark:text-slate-400">{item.createdAt ? formatDateTime(item.createdAt) : 'Data indisponível'}</span>
                <Button variant="outline" disabled={publish.isPending} onClick={() =>
                  setDraft({ version: configuration.data.version, values: { ...configuration.data.values, ...item.values } })}>
                  Restaurar como rascunho
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Nenhuma versão publicada ainda.</p>
        ))}
      </section>
    </div>
  );
}
