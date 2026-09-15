import { getConfigurationGuidance } from '@/features/agent-configuration/configurationGuidance';
import { AgentConfigurationFieldEditor } from '@/components/settings/AgentConfigurationFieldEditor';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useNotification } from '@/contexts/NotificationContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import {
  CATEGORY_DESCRIPTIONS, changedConfigurationValues, configurationFieldError,
  groupConfigurationFields, restoreConfigurationValues, type ConfigurationValues,
} from '@/features/agent-configuration/configurationFields';
import {
  agentConfigurationService, type AgentConfigurationField, type AgentConfigurationValue,
} from '@/services/agentConfiguration.service';
import { formatDateTime } from '@/utils';
import { extractApiErrorMessage } from '@/utils/apiErrors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ChevronDown, History, RefreshCw, Save, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';

const emptyFields: AgentConfigurationField[] = [];
const emptyValues: ConfigurationValues = {};
type Draft = { version: number; values: ConfigurationValues };

function ConfigurationSection({ title, fields, values, published, errors, disabled, initiallyOpen, onChange }: {
  title: string; fields: AgentConfigurationField[]; values: ConfigurationValues; published: ConfigurationValues;
  errors: Record<string, string>; disabled: boolean; initiallyOpen: boolean;
  onChange: (key: string, value: AgentConfigurationValue) => void;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const [page, setPage] = useState(0);
  const pageSize = 6;
  const safePage = Math.min(page, Math.max(0, Math.ceil(fields.length / pageSize) - 1));
  const regionId = `configuration-section-${encodeURIComponent(title)}`;
  return <section className="min-w-0 space-y-5">
    <h3><button type="button" aria-expanded={open} aria-controls={regionId} onClick={() => setOpen((current) => !current)}
      className="flex w-full items-center gap-3 rounded-xl bg-gray-100 p-4 text-left font-semibold text-gray-800 dark:bg-slate-800 dark:text-slate-100">
      <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`} />
      <span className="flex-1">{title}</span><Badge variant="default">{fields.length}</Badge>
    </button></h3>
    {open && <div id={regionId} className="space-y-6">
      {fields.slice(safePage * pageSize, (safePage + 1) * pageSize).map((field) => <AgentConfigurationFieldEditor key={field.key} field={field} value={values[field.key]}
        disabled={disabled} changed={!Object.is(values[field.key], published[field.key])} error={errors[field.key]} onChange={onChange} />)}
      {fields.length > pageSize && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-4 text-sm dark:border-slate-700">
        <span role="status">Campos {safePage * pageSize + 1} a {Math.min((safePage + 1) * pageSize, fields.length)} de {fields.length}</span>
        <div className="flex gap-2"><Button type="button" variant="outline" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>Anteriores</Button>
          <Button type="button" variant="outline" disabled={(safePage + 1) * pageSize >= fields.length} onClick={() => setPage(safePage + 1)}>Próximos</Button></div>
      </div>}
    </div>}
  </section>;
}

function ConfigurationCategory({ group, fields, ...props }: {
  group: string; fields: AgentConfigurationField[]; values: ConfigurationValues; published: ConfigurationValues;
  errors: Record<string, string>; disabled: boolean; initiallyOpen: boolean;
  onChange: (key: string, value: AgentConfigurationValue) => void;
}) {
  const sections = new Map<string, AgentConfigurationField[]>();
  for (const field of fields) {
    const name = getConfigurationGuidance(field).section;
    const items = sections.get(name) ?? [];
    items.push(field); sections.set(name, items);
  }
  return <section className="min-w-0 space-y-6">
    <header className="space-y-2 px-1"><h2 className="flex flex-wrap items-center gap-3 text-xl font-semibold text-gray-900 dark:text-white">{group}<Badge variant="default">{fields.length} campos</Badge></h2>
      <p className="text-sm leading-7 text-gray-500 dark:text-gray-400">{CATEGORY_DESCRIPTIONS[group] || 'Configurações organizadas por etapa de uso do agente.'}</p></header>
    {[...sections].map(([title, items], index) => <ConfigurationSection key={title} {...props} title={title} fields={items} initiallyOpen={props.initiallyOpen || index === 0} />)}
  </section>;
}

export function AgentAdvancedSettingsPanel() {
  const queryClient = useQueryClient();
  const workspace = useWorkspace();
  const { addToast } = useNotification();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [changedOnly, setChangedOnly] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const canEdit = ['owner', 'admin'].includes(workspace.role);
  const configurationKey = ['agent', 'configuration', workspace.id, workspace.user?.id] as const;

  const configuration = useQuery({
    queryKey: configurationKey, queryFn: agentConfigurationService.get,
    staleTime: 30_000, refetchOnWindowFocus: false,
  });
  const history = useQuery({
    queryKey: [...configurationKey, 'history'], queryFn: agentConfigurationService.history, enabled: showHistory,
  });
  const fields = configuration.data?.fields ?? emptyFields;
  const published = configuration.data?.values ?? emptyValues;
  const values = draft?.values ?? published;
  const changes = useMemo(() => changedConfigurationValues(fields, values, published), [fields, values, published]);
  const changedCount = Object.keys(changes).length;
  const conflict = draft !== null && draft.version !== configuration.data?.version;
  const categories = useMemo(() => groupConfigurationFields(fields, published), [fields, published]);
  const activeCategory = groupFilter ?? (!search.trim() && !changedOnly ? categories[0]?.[0] ?? '' : '');
  const groups = useMemo(() => groupConfigurationFields(fields, values, {
    search, category: activeCategory, changedOnly, published,
  }), [fields, values, search, activeCategory, changedOnly, published]);
  const errors = useMemo(() => {
    const result: Record<string, string> = {};
    for (const field of fields) {
      if (!(field.key in changes)) continue;
      const error = configurationFieldError(field, values[field.key]);
      if (error) result[field.key] = error;
    }
    return result;
  }, [fields, values, changes]);
  const errorCount = Object.keys(errors).length;

  const publish = useMutation({
    mutationFn: ({ version, values: update }: Draft) => agentConfigurationService.publish(version, update),
    onSuccess: (next) => {
      queryClient.setQueryData(configurationKey, next);
      setDraft(null);
      setChangedOnly(false);
      void queryClient.invalidateQueries({ queryKey: [...configurationKey, 'history'] });
      addToast({ title: `Configuração v${next.version} publicada`, message: 'O agente usará os novos valores nos próximos atendimentos.', type: 'success' });
    },
    onError: (error) => {
      if ((error as { response?: { status?: number } }).response?.status === 409) {
        void queryClient.invalidateQueries({ queryKey: configurationKey, exact: true });
      }
      addToast({ title: 'Falha ao publicar', message: extractApiErrorMessage(error, 'Não foi possível publicar a configuração.'), type: 'error' });
    },
  });

  const changeValue = (key: string, value: AgentConfigurationValue) => {
    if (!canEdit || publish.isPending || !configuration.data) return;
    setDraft((current) => ({ version: current?.version ?? configuration.data.version,
      values: { ...(current?.values ?? published), [key]: value } }));
  };
  const clearFilters = () => { setSearch(''); setGroupFilter(null); setChangedOnly(false); };
  const discard = () => { setDraft(null); setChangedOnly(false); publish.reset(); };

  if (configuration.isLoading) return <Loading />;
  if (!configuration.data) {
    return (
      <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-2">
          <p className="font-semibold">Configuração avançada indisponível</p>
          <p>{extractApiErrorMessage(configuration.error, 'Não foi possível carregar as configurações do agente.')}</p>
          <Button type="button" variant="outline" loading={configuration.isFetching} onClick={() => void configuration.refetch()}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <SlidersHorizontal className="mt-1 h-5 w-5 shrink-0 text-primary-600 dark:text-primary-300" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{fields.length} configurações em {categories.length} categorias</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Escolha uma categoria. Cada campo explica para que serve e em que etapa é utilizado.</p>
            {configuration.data.updatedAt && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Última atualização: {formatDateTime(configuration.data.updatedAt)}</p>}
          </div>
        </div>
        <Badge variant="primary">{configuration.data.version > 0 ? `Versão ${configuration.data.version}` : 'Configuração inicial'}</Badge>
      </div>

      {!canEdit && <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">Modo de consulta. A publicação de alterações é restrita ao proprietário e aos administradores da empresa.</p>}

      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Buscar nas configurações" type="search" value={search} onChange={(event) => { setSearch(event.target.value); setGroupFilter(null); }} placeholder="Ex.: PIX, memória, modelo ou trecho de mensagem" />
          <Select label="Categoria" value={activeCategory} onChange={(event) => setGroupFilter(event.target.value)}
            options={[{ value: '', label: `Busca em todas as categorias (${fields.length})` }, ...categories.map(([group, items]) => ({ value: group, label: `${group} (${items.length})` }))]} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span role="status">{groups.reduce((total, [, items]) => total + items.length, 0)} de {fields.length} campos</span>
            {canEdit && <label className="flex items-center gap-2"><input type="checkbox" checked={changedOnly} onChange={(event) => { setChangedOnly(event.target.checked); setGroupFilter(null); }} className="h-4 w-4 accent-blue-600" />Somente alterados ({changedCount})</label>}
          </div>
          {canEdit && <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={!draft || publish.isPending} onClick={discard}>Descartar</Button>
            <Button type="button" loading={publish.isPending} disabled={!changedCount || conflict || errorCount > 0}
              onClick={() => { if (canEdit && draft && changedCount && !conflict && !errorCount) publish.mutate({ version: draft.version, values: changes }); }}>
              <Save className="h-4 w-4" />Publicar nova versão
            </Button>
          </div>}
        </div>
      </div>

      {conflict && <div role="alert" className="space-y-2 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        <p>Outra versão foi publicada. Seu rascunho foi preservado. Descarte-o para carregar os valores atuais antes de editar novamente.</p>
        <Button type="button" variant="outline" disabled={publish.isPending} onClick={discard}>Descartar rascunho e usar versão atual</Button>
      </div>}
      {configuration.isError && <div role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        Não foi possível atualizar os dados. <Button type="button" variant="ghost" loading={configuration.isFetching} onClick={() => void configuration.refetch()}><RefreshCw className="h-4 w-4" />Tentar novamente</Button>
      </div>}
      {errorCount > 0 && <p role="alert" className="text-sm text-red-600 dark:text-red-300">Revise {errorCount} campo(s) antes de publicar: {fields.filter((field) => errors[field.key]).map((field) => field.label).join(', ')}.</p>}
      {publish.isError && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{extractApiErrorMessage(publish.error, 'Não foi possível publicar. Seu rascunho foi preservado.')}</p>}

      <div className="grid items-start gap-8 xl:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label="Categorias de configuração" className="hidden space-y-1 rounded-2xl border border-gray-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 xl:block">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Categorias</p>
          {categories.map(([name, items]) => <button type="button" key={name} aria-current={activeCategory === name ? 'page' : undefined}
            onClick={() => { setGroupFilter(name); setSearch(''); }}
            className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm ${activeCategory === name ? 'bg-primary-50 font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-200' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800'}`}>
            <span>{name}</span><span className="text-xs opacity-70">{items.length}</span>
          </button>)}
        </nav>
        <div className="min-w-0 space-y-10">
      {groups.length ? groups.map(([group, items]) => (
        <ConfigurationCategory key={JSON.stringify([group, search, groupFilter, changedOnly])} group={group} fields={items}
          values={values} published={published} errors={errors} disabled={!canEdit || publish.isPending}
          initiallyOpen={Boolean(search.trim() || changedOnly)} onChange={changeValue} />
      )) : (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-slate-700">
          <p className="font-medium text-gray-900 dark:text-white">{fields.length ? 'Nenhuma configuração encontrada' : 'Nenhum campo disponível no catálogo'}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{changedOnly ? 'Os campos alterados aparecem aqui para revisão.' : 'A busca considera nomes, descrições, identificadores e valores das configurações.'}</p>
          {(search || groupFilter || changedOnly) && <Button type="button" variant="outline" className="mt-4" onClick={clearFilters}>Limpar filtros</Button>}
        </div>
      )}

      </div></div>

      <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white"><History className="h-5 w-5 text-gray-500" />Histórico de publicação</h2>
          <Button type="button" variant="outline" aria-expanded={showHistory} aria-controls="configuration-history" onClick={() => setShowHistory((current) => !current)}>{showHistory ? 'Ocultar histórico' : 'Ver histórico'}</Button>
        </div>
        <div id="configuration-history" hidden={!showHistory}>
          {showHistory && history.isLoading && <p className="text-sm text-gray-500">Carregando histórico…</p>}
          {showHistory && history.isError && <div role="alert" className="space-y-2 text-sm text-red-600 dark:text-red-300">
            <p>{extractApiErrorMessage(history.error, 'Não foi possível carregar o histórico.')}</p>
            <Button type="button" variant="outline" onClick={() => void history.refetch()}>Tentar novamente</Button>
          </div>}
          {showHistory && history.isSuccess && (history.data.length ? (
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {history.data.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div><p className="font-medium text-gray-900 dark:text-gray-100">Versão {item.version}</p>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">{item.createdAt ? formatDateTime(item.createdAt) : 'Data indisponível'}</p></div>
                {canEdit && <Button type="button" variant="outline" disabled={publish.isPending} onClick={() => {
                  setDraft({ version: configuration.data.version, values: restoreConfigurationValues(fields, published, item.values) });
                  setSearch(''); setGroupFilter(null); setChangedOnly(true); publish.reset();
                }}>Restaurar como rascunho</Button>}
              </div>)}
            </div>
          ) : <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma versão publicada ainda.</p>)}
        </div>
      </section>
    </div>
  );
}
