import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState, Loading } from '@/components/ui/EmptyState';
import { useNotification } from '@/contexts/NotificationContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import {
  PersonaAudienceForm,
  PersonaEscalationForm,
  PersonaExamplesEditor,
  PersonaIdentityForm,
  PersonaObjectionsForm,
  PersonaPresentationForm,
  PersonaPreview,
  PersonaQualificationForm,
  PersonaRestrictionsForm,
  PersonaTestPanel,
  PersonaToneForm,
  PersonaUpsellForm,
  createEmptyPersonaDraft,
} from '@/features/persona';
import { personaKeys, personaService } from '@/features/persona/services/persona.service';
import type { AgentPersona, PersonaStatus, PersonaVersion } from '@/features/persona/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Bot, Clock3, Eye, History, MessageSquareText, Plus, Save, ShieldAlert, SlidersHorizontal, Target, UserRoundCog, Wand2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const statusLabels: Record<PersonaStatus, string> = {
  draft: 'Rascunho',
  active: 'Ativa',
  inactive: 'Inativa',
};

const statusVariant: Record<PersonaStatus, 'default' | 'success' | 'warning'> = {
  draft: 'warning',
  active: 'success',
  inactive: 'default',
};

function personaSortValue(status: PersonaStatus): number {
  if (status === 'active') return 0;
  if (status === 'draft') return 1;
  return 2;
}

function sortPersonas(items: AgentPersona[]): AgentPersona[] {
  return [...items].sort((a, b) => {
    const statusDiff = personaSortValue(a.status) - personaSortValue(b.status);
    if (statusDiff) return statusDiff;
    return new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() - new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
  });
}

function formatDate(value?: string): string {
  if (!value) return 'Sem data';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function errorMessage(error: unknown): string {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: string | { message?: string; missingFields?: string[] } } } }).response;
    const detail = response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (detail?.message) {
      const missing = detail.missingFields?.length ? ` Campos pendentes: ${detail.missingFields.join(', ')}.` : '';
      return `${detail.message}${missing}`;
    }
  }
  if (error instanceof Error) return error.message;
  return 'Nao foi possivel concluir a operacao.';
}

function snapshotSummary(version?: PersonaVersion): string {
  if (!version) return 'Selecione uma versao para visualizar o snapshot.';
  const snapshot = version.snapshot;
  const lines = [
    `Nome: ${snapshot.name ?? 'Nao configurado'}`,
    `Funcao: ${snapshot.role ?? 'Nao configurado'}`,
    `Segmento: ${snapshot.segment ?? 'Nao configurado'}`,
    `Tom: ${snapshot.tone ?? 'Nao configurado'}`,
    `Status: ${snapshot.status ?? 'Nao configurado'}`,
    `Objetivos: ${(snapshot.salesGoals ?? []).join(', ') || 'Nao configurado'}`,
    `Restricoes: ${(snapshot.restrictions ?? []).join(', ') || 'Nao configurado'}`,
  ];
  return lines.join('\n');
}

export function PersonaPage() {
  const workspace = useWorkspace();
  const queryClient = useQueryClient();
  const { addToast } = useNotification();
  const [selectedId, setSelectedId] = useState<string>();
  const [draft, setDraft] = useState<AgentPersona>(() => createEmptyPersonaDraft());
  const [savedDraft, setSavedDraft] = useState<AgentPersona>(() => createEmptyPersonaDraft());
  const [showVersions, setShowVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number>();
  const [testResponse, setTestResponse] = useState<string>();
  const [testError, setTestError] = useState<string>();

  const canView = workspace.role === 'owner' || workspace.role === 'admin' || workspace.role === 'supervisor';
  const canManage = workspace.role === 'owner' || workspace.role === 'admin';

  const listQuery = useQuery({
    queryKey: personaKeys.list(workspace.id),
    queryFn: personaService.listPersonas,
    enabled: canView && workspace.id !== 'legacy',
  });

  const personas = useMemo(() => sortPersonas(listQuery.data?.items ?? []), [listQuery.data?.items]);

  const detailQuery = useQuery({
    queryKey: selectedId ? personaKeys.detail(workspace.id, selectedId) : ['persona', workspace.id, 'none'],
    queryFn: () => personaService.getPersona(selectedId ?? ''),
    enabled: Boolean(selectedId && canView),
  });

  const versionsQuery = useQuery({
    queryKey: selectedId ? personaKeys.versions(workspace.id, selectedId) : ['persona-versions', workspace.id, 'none'],
    queryFn: () => personaService.listPersonaVersions(selectedId ?? ''),
    enabled: Boolean(selectedId && canView && showVersions),
  });

  const versionQuery = useQuery({
    queryKey: selectedId && selectedVersion ? personaKeys.version(workspace.id, selectedId, selectedVersion) : ['persona-version', workspace.id, 'none'],
    queryFn: () => personaService.getPersonaVersion(selectedId ?? '', selectedVersion ?? 0),
    enabled: Boolean(selectedId && selectedVersion && showVersions),
  });

  const dirty = JSON.stringify(draft) !== JSON.stringify(savedDraft);
  const isReadOnly = !canManage;

  useEffect(() => {
    if (!selectedId && personas.length > 0) {
      setSelectedId(listQuery.data?.activePersonaId ?? personas[0].id);
    }
  }, [listQuery.data?.activePersonaId, personas, selectedId]);

  useEffect(() => {
    if (detailQuery.data) {
      setDraft(detailQuery.data);
      setSavedDraft(detailQuery.data);
      setTestResponse(undefined);
      setTestError(undefined);
    }
  }, [detailQuery.data]);

  const invalidatePersonaQueries = async (personaId?: string) => {
    await queryClient.invalidateQueries({ queryKey: personaKeys.list(workspace.id) });
    if (personaId) {
      await queryClient.invalidateQueries({ queryKey: personaKeys.detail(workspace.id, personaId) });
      await queryClient.invalidateQueries({ queryKey: personaKeys.versions(workspace.id, personaId) });
    }
  };

  const createMutation = useMutation({
    mutationFn: () => personaService.createPersona(draft),
    onSuccess: async (created) => {
      setSelectedId(created.id);
      setDraft(created);
      setSavedDraft(created);
      await invalidatePersonaQueries(created.id);
      addToast({ title: 'Persona criada', message: 'Rascunho salvo pelo backend.', type: 'success' });
    },
    onError: (error) => addToast({ title: 'Nao foi possivel criar', message: errorMessage(error), type: 'error' }),
  });

  const saveMutation = useMutation({
    mutationFn: () => personaService.updatePersona(selectedId ?? '', draft),
    onSuccess: async (updated) => {
      setDraft(updated);
      setSavedDraft(updated);
      await invalidatePersonaQueries(updated.id);
      addToast({ title: 'Persona salva', message: `Versao ${updated.version ?? ''} atualizada pelo backend.`, type: 'success' });
    },
    onError: (error) => addToast({ title: 'Nao foi possivel salvar', message: errorMessage(error), type: 'error' }),
  });

  const activateMutation = useMutation({
    mutationFn: () => personaService.activatePersona(selectedId ?? ''),
    onSuccess: async (updated) => {
      setDraft(updated);
      setSavedDraft(updated);
      await invalidatePersonaQueries(updated.id);
      addToast({
        title: 'Persona ativada',
        message: 'Esta persona passa a orientar o atendimento automático do agente neste workspace.',
        type: 'success',
      });
    },
    onError: (error) => addToast({ title: 'Nao foi possivel ativar', message: errorMessage(error), type: 'error' }),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => personaService.deactivatePersona(selectedId ?? ''),
    onSuccess: async (updated) => {
      setDraft(updated);
      setSavedDraft(updated);
      await invalidatePersonaQueries(updated.id);
      addToast({ title: 'Persona desativada', message: 'O registro foi preservado como inativo.', type: 'success' });
    },
    onError: (error) => addToast({ title: 'Nao foi possivel desativar', message: errorMessage(error), type: 'error' }),
  });

  const testMutation = useMutation({
    mutationFn: (customerMessage: string) => personaService.testPersona({
      persona: draft,
      customerMessage,
      optionalContext: { workspaceName: workspace.name },
    }),
    onMutate: () => {
      setTestResponse(undefined);
      setTestError(undefined);
    },
    onSuccess: (result) => {
      setTestResponse(result.response);
      if (result.warnings.length) {
        addToast({ title: 'Teste executado com avisos', message: result.warnings.join(' '), type: 'warning' });
      }
    },
    onError: (error) => setTestError(errorMessage(error)),
  });

  const handleSelect = (personaId?: string) => {
    if (dirty && !window.confirm('Existem alteracoes nao salvas. Deseja descartar e trocar de persona?')) return;
    setSelectedId(personaId);
    setSelectedVersion(undefined);
    setShowVersions(false);
    if (!personaId) {
      const empty = createEmptyPersonaDraft();
      setDraft(empty);
      setSavedDraft(empty);
    }
  };

  const handleCreate = () => {
    if (!canManage || createMutation.isPending) return;
    createMutation.mutate();
  };

  const handleSave = () => {
    if (!selectedId || !canManage || saveMutation.isPending) return;
    saveMutation.mutate();
  };

  const handleActivate = () => {
    if (!selectedId || !window.confirm('Ativar esta persona? Apenas uma persona pode ficar ativa por workspace.')) return;
    activateMutation.mutate();
  };

  const handleDeactivate = () => {
    if (!selectedId || !window.confirm('Desativar esta persona? O registro sera preservado.')) return;
    deactivateMutation.mutate();
  };

  const busy = createMutation.isPending || saveMutation.isPending || activateMutation.isPending || deactivateMutation.isPending;

  if (!canView) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Persona indisponivel para seu perfil"
        description="A visualizacao da persona exige permissao de workspace owner, admin ou supervisor."
      />
    );
  }

  if (listQuery.isLoading || workspace.isLoading) return <Loading text="Carregando personas..." />;

  if (listQuery.isError || workspace.error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Nao foi possivel carregar personas"
        description={errorMessage(listQuery.error ?? workspace.error)}
        action={<Button onClick={() => { void listQuery.refetch(); }}>Tentar novamente</Button>}
      />
    );
  }

  const activePersona = personas.find((p) => p.status === 'active');
  const sectionClass = 'scroll-mt-28';

  return (
    <div className="space-y-6 pb-24">
      <div className="overflow-hidden rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-5 dark:border-blue-900/50 dark:from-blue-950/40 dark:via-slate-950 dark:to-slate-900 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
              Agente automático
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Persona do agente
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
              Defina como o agente fala com o cliente na Central de Conversão. Tudo que você
              salvar e <strong>ativar</strong> passa a orientar o atendimento automático
              (tom, objeções, restrições e transferência humana).
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-white px-3 py-1 text-blue-700 ring-1 ring-blue-100 dark:bg-slate-900 dark:text-blue-200 dark:ring-blue-900/50">
                1. Preencher
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-blue-700 ring-1 ring-blue-100 dark:bg-slate-900 dark:text-blue-200 dark:ring-blue-900/50">
                2. Salvar
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-blue-700 ring-1 ring-blue-100 dark:bg-slate-900 dark:text-blue-200 dark:ring-blue-900/50">
                3. Ativar no agente
              </span>
            </div>
          </div>
          <div className="flex min-w-[220px] flex-col gap-2 rounded-xl border border-white/70 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status no workspace</p>
            {activePersona ? (
              <>
                <Badge variant="success">Persona ativa</Badge>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{activePersona.name}</p>
                <p className="text-xs text-gray-500">Versão {activePersona.version ?? 1}</p>
              </>
            ) : (
              <>
                <Badge variant="warning">Nenhuma ativa</Badge>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Salve um rascunho e clique em Ativar para o agente usar no atendimento.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {!canManage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          Seu perfil pode visualizar personas e histórico. Edição, ativação e desativação exigem owner ou admin.
        </div>
      )}

      <Card title="Personas do workspace" icon={UserRoundCog}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Escolha uma persona para editar ou crie um novo rascunho.
          </p>
          <Button variant="outline" onClick={() => handleSelect(undefined)} disabled={busy || isReadOnly}>
            <Plus className="h-4 w-4" /> Novo rascunho
          </Button>
        </div>
        {personas.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="Nenhuma persona cadastrada"
            description="Crie o primeiro rascunho, preencha identidade/tom/regras e ative para o agente usar nas conversas."
            action={
              <Button onClick={handleCreate} loading={createMutation.isPending} disabled={isReadOnly}>
                Criar primeiro rascunho
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {personas.map((persona) => (
              <button
                key={persona.id}
                type="button"
                onClick={() => handleSelect(persona.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  selectedId === persona.id
                    ? 'border-blue-500 bg-blue-50 shadow-sm dark:bg-blue-950/30'
                    : 'border-gray-200 hover:border-blue-300 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{persona.name || 'Sem nome'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{persona.role || 'Função não configurada'}</p>
                  </div>
                  <Badge variant={statusVariant[persona.status]}>{statusLabels[persona.status]}</Badge>
                </div>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Versão {persona.version ?? 1} · {formatDate(persona.updatedAt ?? persona.createdAt)}
                </p>
              </button>
            ))}
          </div>
        )}
      </Card>

      {detailQuery.isFetching && selectedId ? <Loading text="Carregando detalhe da persona..." /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card title="1. Identidade" icon={UserRoundCog} className={sectionClass}>
            <PersonaIdentityForm value={draft} onChange={setDraft} disabled={busy || isReadOnly} />
          </Card>
          <Card title="2. Tom de voz" icon={SlidersHorizontal} className={sectionClass}>
            <PersonaToneForm value={draft} onChange={setDraft} disabled={busy || isReadOnly} />
          </Card>
          <Card title="3. Apresentação" icon={MessageSquareText} className={sectionClass}>
            <PersonaPresentationForm value={draft} onChange={setDraft} disabled={busy || isReadOnly} />
          </Card>
          <Card title="4. Público e objetivos" icon={Target} className={sectionClass}>
            <PersonaAudienceForm value={draft} onChange={setDraft} disabled={busy || isReadOnly} />
          </Card>
          <Card title="5. Qualificação" icon={AlertCircle} className={sectionClass}>
            <PersonaQualificationForm value={draft} onChange={setDraft} disabled={busy || isReadOnly} />
          </Card>
          <Card title="6. Objeções" icon={MessageSquareText} className={sectionClass}>
            <PersonaObjectionsForm value={draft} onChange={setDraft} disabled={busy || isReadOnly} />
          </Card>
          <Card title="7. Upsell e recomendação" icon={Wand2} className={sectionClass}>
            <PersonaUpsellForm value={draft} onChange={setDraft} disabled={busy || isReadOnly} />
          </Card>
          <Card title="8. Transferência humana" icon={Bot} className={sectionClass}>
            <PersonaEscalationForm value={draft} onChange={setDraft} disabled={busy || isReadOnly} />
          </Card>
          <Card title="9. Restrições" icon={ShieldAlert} className={sectionClass}>
            <PersonaRestrictionsForm value={draft} onChange={setDraft} disabled={busy || isReadOnly} />
          </Card>
          <Card title="10. Exemplos de diálogo" icon={MessageSquareText} className={sectionClass}>
            <PersonaExamplesEditor
              value={draft.examples ?? []}
              onChange={(examples) => setDraft({ ...draft, examples })}
              disabled={busy || isReadOnly}
            />
          </Card>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <PersonaPreview persona={draft} />
          <PersonaTestPanel
            persona={draft}
            disabled={!canView}
            isLoading={testMutation.isPending}
            response={testResponse}
            error={testError}
            onTest={(message) => testMutation.mutate(message)}
          />
          <Card title="Publicar no agente" icon={Save}>
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              Salve as alterações e ative a persona. Só a persona ativa alimenta o atendimento automático.
            </p>
            <div className="grid gap-2">
              <Button
                className="w-full"
                onClick={selectedId ? handleSave : handleCreate}
                loading={selectedId ? saveMutation.isPending : createMutation.isPending}
                disabled={isReadOnly || (selectedId ? !dirty : false)}
              >
                <Save className="h-4 w-4" /> {selectedId ? 'Salvar alterações' : 'Criar rascunho'}
              </Button>
              <Button
                className="w-full"
                onClick={handleActivate}
                loading={activateMutation.isPending}
                disabled={!selectedId || isReadOnly || draft.status === 'active' || dirty}
              >
                Ativar no agente
              </Button>
              {dirty && selectedId ? (
                <p className="text-xs text-amber-600 dark:text-amber-300">
                  Há alterações não salvas. Salve antes de ativar.
                </p>
              ) : null}
              <Button
                className="w-full"
                variant="outline"
                onClick={handleDeactivate}
                loading={deactivateMutation.isPending}
                disabled={!selectedId || isReadOnly || draft.status !== 'active'}
              >
                Desativar persona
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => setShowVersions((current) => !current)}
                disabled={!selectedId}
              >
                <History className="h-4 w-4" /> Histórico de versões
              </Button>
            </div>
          </Card>

          {showVersions && selectedId && (
            <Card title="Versões" icon={Clock3}>
              {versionsQuery.isLoading ? <Loading text="Carregando versões..." /> : null}
              {versionsQuery.isError ? (
                <p className="text-sm text-red-600 dark:text-red-300">{errorMessage(versionsQuery.error)}</p>
              ) : null}
              <div className="space-y-2">
                {(versionsQuery.data ?? []).map((version) => (
                  <button
                    key={version.id}
                    type="button"
                    onClick={() => setSelectedVersion(version.version)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                      selectedVersion === version.version
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <span className="font-semibold">Versão {version.version}</span>
                    <span className="ml-2 text-gray-500">{version.changeType}</span>
                    <p className="text-xs text-gray-500">{formatDate(version.createdAt)}</p>
                  </button>
                ))}
              </div>
              {selectedVersion && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                    <Eye className="h-4 w-4" /> Snapshot somente leitura
                  </div>
                  <pre className="whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-300">
                    {versionQuery.isLoading ? 'Carregando snapshot...' : snapshotSummary(versionQuery.data)}
                  </pre>
                </div>
              )}
            </Card>
          )}
        </aside>
      </div>

      {!isReadOnly && (dirty || !selectedId) && (
        <div className="fixed bottom-4 left-4 right-4 z-30 mx-auto max-w-3xl rounded-2xl border border-blue-200 bg-white/95 p-3 shadow-xl backdrop-blur dark:border-blue-900/50 dark:bg-slate-950/95 lg:left-[calc(16rem+1rem)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {selectedId
                ? 'Alterações pendentes — salve para o backend versionar a persona.'
                : 'Novo rascunho — crie para começar a configurar o agente.'}
            </p>
            <Button
              onClick={selectedId ? handleSave : handleCreate}
              loading={selectedId ? saveMutation.isPending : createMutation.isPending}
              disabled={selectedId ? !dirty : false}
            >
              <Save className="h-4 w-4" /> {selectedId ? 'Salvar agora' : 'Criar rascunho'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
