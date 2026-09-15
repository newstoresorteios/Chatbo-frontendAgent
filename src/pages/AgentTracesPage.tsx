import { Badge } from '@/components/ui/Badge';
import { TraceQualityDetails } from '../components/agents/TraceQualityDetails';
import { Button } from '@/components/ui/Button';
import { EmptyState, Loading } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import {
  agentTraceService,
  type AgentTraceOutcome,
  type AgentTraceSummary,
} from '@/services/agentTrace.service';
import { extractApiErrorMessage } from '@/utils/apiErrors';
import { formatDateTime } from '@/utils';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Activity, Bot, Clock3, Database, RefreshCw, Search, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const outcomeLabels: Record<AgentTraceOutcome, string> = {
  delivered: 'Entregue',
  fallback: 'Fallback',
  handoff: 'Transferido',
  failed: 'Falhou',
};

const outcomeVariants: Record<AgentTraceOutcome, 'success' | 'warning' | 'primary' | 'danger'> = {
  delivered: 'success',
  fallback: 'warning',
  handoff: 'primary',
  failed: 'danger',
};

function TraceRow({ trace, selected, onSelect }: {
  trace: AgentTraceSummary;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full border-b border-slate-200 p-4 text-left transition-colors last:border-b-0 dark:border-slate-700 ${selected ? 'bg-cyan-50 dark:bg-cyan-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={outcomeVariants[trace.outcome]}>{outcomeLabels[trace.outcome]}</Badge>
            <span className="text-xs uppercase text-slate-500">{trace.channel}</span>
            <span className="text-xs text-slate-400">{trace.executionPath}</span>
          </div>
          <p className="mt-2 truncate text-sm font-medium text-slate-900 dark:text-white">
            {trace.inputPreview || trace.intent || 'Execução sem prévia da mensagem'}
          </p>
          <p className="mt-1 truncate font-mono text-xs text-slate-500">{trace.traceId}</p>
        </div>
        <div className="shrink-0 text-right text-xs text-slate-500">
          <p>{trace.durationMs ? `${Math.round(trace.durationMs)} ms` : '—'}</p>
          <p className="mt-1">{formatDateTime(trace.createdAt)}</p>
        </div>
      </div>
    </button>
  );
}

function StageTimeline({ stages }: { stages: Record<string, number> }) {
  const entries = Object.entries(stages).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, duration]) => duration), 1);
  if (!entries.length) return <p className="text-sm text-slate-500">Tempos por etapa não disponíveis.</p>;
  return (
    <div className="space-y-3">
      {entries.map(([stage, duration]) => (
        <div key={stage}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
            <span className="font-mono text-slate-600 dark:text-slate-300">{stage}</span>
            <span className="text-slate-500">{Math.round(duration)} ms</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.max(3, (duration / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AgentTracesPage() {
  const [channel, setChannel] = useState('');
  const [outcome, setOutcome] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const traces = useInfiniteQuery({
    queryKey: ['agent', 'traces', channel, outcome],
    queryFn: ({ pageParam }) => agentTraceService.list({ channel: channel || undefined, outcome: outcome || undefined, before: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.hasNext ? page.nextCursor : undefined,
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  });

  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    const items = [...new Map((traces.data?.pages.flatMap((page) => page.items) ?? []).map((item) => [item.id, item])).values()];
    if (!term) return items;
    return items.filter((item) => [item.traceId, item.inputPreview, item.outputPreview, item.intent]
      .some((value) => String(value ?? '').toLocaleLowerCase('pt-BR').includes(term)));
  }, [search, traces.data]);

  useEffect(() => {
    if (selectedId == null && visible[0]) setSelectedId(visible[0].id);
    if (selectedId != null && !visible.some((item) => item.id === selectedId)) setSelectedId(visible[0]?.id ?? null);
  }, [selectedId, visible]);

  const detail = useQuery({
    queryKey: ['agent', 'trace', selectedId],
    queryFn: () => agentTraceService.get(selectedId as number),
    enabled: selectedId != null,
  });

  if (traces.isLoading) return <Loading />;
  if (traces.error) {
    return <EmptyState icon={Activity} title="Execuções indisponíveis" description={extractApiErrorMessage(traces.error, 'Não foi possível carregar os traces do agente.')} />;
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-600"><Activity className="h-5 w-5" /><span className="text-sm font-semibold uppercase tracking-wide">Observabilidade</span></div>
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">Execuções do agente</h1>
          <p className="mt-1 text-sm text-slate-500">Acompanhe decisões, consultas, latência e fallbacks sem expor credenciais ou dados sensíveis.</p>
        </div>
        <Button variant="outline" loading={traces.isFetching} onClick={() => traces.refetch()}><RefreshCw className="h-4 w-4" />Atualizar</Button>
      </header>

      <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
        <label className="relative self-end">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar trace, intenção ou mensagem" className="min-h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
        </label>
        <Select label="Canal" value={channel} onChange={(event) => setChannel(event.target.value)} options={[{ value: '', label: 'Todos' }, { value: 'whatsapp', label: 'WhatsApp' }, { value: 'instagram', label: 'Instagram' }, { value: 'webchat', label: 'Webchat' }]} />
        <Select label="Resultado" value={outcome} onChange={(event) => setOutcome(event.target.value)} options={[{ value: '', label: 'Todos' }, ...Object.entries(outcomeLabels).map(([value, label]) => ({ value, label }))]} />
      </div>

      {!visible.length ? (
        <EmptyState icon={Activity} title="Nenhuma execução encontrada" description="Novos atendimentos aparecerão aqui assim que o NSAgent gravar traces vinculados ao workspace." />
      ) : (
        <div className="grid min-h-[620px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:grid-cols-[minmax(340px,0.9fr)_minmax(460px,1.4fr)]">
          <div className="max-h-[760px] overflow-y-auto border-r border-slate-200 dark:border-slate-700">
            {visible.map((trace) => <TraceRow key={trace.id} trace={trace} selected={trace.id === selectedId} onSelect={() => setSelectedId(trace.id)} />)}
            {traces.hasNextPage && <div className="p-4"><Button variant="outline" loading={traces.isFetchingNextPage} onClick={() => void traces.fetchNextPage()}>Carregar execuções anteriores</Button></div>}
          </div>
          <div className="max-h-[760px] overflow-y-auto p-5 lg:p-6">
            {detail.error ? (
              <EmptyState icon={Activity} title="Detalhes indisponíveis" description={extractApiErrorMessage(detail.error, 'Não foi possível carregar esta execução.')} />
            ) : detail.isLoading || !detail.data ? <Loading /> : (
              <div className="space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><Badge variant={outcomeVariants[detail.data.outcome]}>{outcomeLabels[detail.data.outcome]}</Badge><Badge variant="default">{detail.data.channel}</Badge></div>
                  <p className="mt-3 break-all font-mono text-sm text-slate-700 dark:text-slate-200">{detail.data.traceId}</p>
                  <p className="mt-2 text-sm text-slate-500">{detail.data.outputPreview || 'Sem prévia de resposta.'}</p>
                  <p className="mt-2 text-xs text-slate-500">Persona {detail.data.personaVersionId ?? '—'} · Configuração {detail.data.configurationVersion ?? 'legada'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[{ label: 'Tempo', value: detail.data.durationMs != null ? `${Math.round(detail.data.durationMs)} ms` : '—', icon: Clock3 }, { label: 'OpenAI', value: detail.data.openAiCalls ?? '—', icon: Bot }, { label: 'Tray', value: detail.data.trayCalls ?? '—', icon: Wrench }, { label: 'Banco', value: detail.data.databaseCalls ?? '—', icon: Database }].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><Icon className="h-4 w-4 text-cyan-600" /><p className="mt-2 text-xs text-slate-500">{label}</p><p className="font-semibold text-slate-900 dark:text-white">{String(value)}</p></div>
                  ))}
                </div>

                <section><h2 className="mb-3 font-semibold text-slate-900 dark:text-white">Tempo por etapa</h2><StageTimeline stages={detail.data.stages} /></section>
                <TraceQualityDetails trace={detail.data} />
                <section className="space-y-3">
                  <h2 className="font-semibold text-slate-900 dark:text-white">Consultas realizadas</h2>
                  {(detail.data.catalogQueries ?? []).map((query, index) => <div key={`catalog-${index}`} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
                    <div className="flex justify-between gap-3"><span>Catálogo · {query.strategy}</span><span>{query.status === 'ok' ? `${query.result_count ?? 0} resultados` : 'falha na consulta'} · {Math.round(query.duration_ms)} ms</span></div>
                    <dl className="mt-2 grid gap-1 text-xs text-slate-500">{Object.entries(query.filters).map(([key, value]) => <div key={key} className="flex gap-2"><dt>{key}:</dt><dd className="break-all">{String(value)}</dd></div>)}</dl>
                  </div>)}
                  {!detail.data.trayTools.length && !detail.data.llmCalls.length ? <p className="text-sm text-slate-500">Nenhuma consulta externa registrada.</p> : null}
                  {detail.data.trayTools.map((tool, index) => <div key={`${tool.tool}-${index}`} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"><span className="font-mono">Tray · {tool.tool || 'consulta'}</span><span className={tool.ok ? 'text-emerald-600' : 'text-red-500'}>{tool.ok ? 'sucesso' : 'falha'} · {Math.round(tool.elapsed_ms ?? 0)} ms</span></div>)}
                  {detail.data.llmCalls.map((call, index) => <div key={`llm-${index}`} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"><span className="font-mono">OpenAI · {String(call.call_type ?? call.model ?? 'geração')}</span><span className="text-slate-500">{String(call.elapsed_ms ? `${Math.round(Number(call.elapsed_ms))} ms` : call.route ?? '')}</span></div>)}
                </section>
                {detail.data.fallbackReasons.length ? <section><h2 className="mb-2 font-semibold text-amber-700 dark:text-amber-300">Fallbacks</h2><ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">{detail.data.fallbackReasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul></section> : null}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
