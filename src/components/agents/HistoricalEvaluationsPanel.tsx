import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { extractApiErrorMessage } from '@/utils/apiErrors';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface Evaluation {
  id: string;
  status: string;
  createdAt?: string;
  question?: string;
  historicalReply?: string;
  replayReply?: string;
  outcome?: 'passed' | 'failed' | 'inconclusive';
  error?: string;
  generativeExercised?: boolean;
  assessment?: { summary: string; historical_outcome: string; findings: Array<{
    stage: string; severity: string; explanation: string; evidence: string; suggested_fix: string;
  }> };
  path: Record<string, unknown>;
  tools: Array<{tool: string; arguments: Record<string, unknown>; error?: string; elapsed_ms: number}>;
  versions: Record<string, unknown>;
  repair: {status?: string; applied?: boolean; instruction?: string; reason?: string};
}

export function HistoricalEvaluationsPanel() {
  const workspace = useWorkspace();
  const query = useQuery({
    queryKey: ['agent-learning', 'evaluations', workspace.id],
    enabled: !workspace.isLoading && Boolean(workspace.user),
    queryFn: async () => (await api.get<{items: Evaluation[]}>('/agent-learning/evaluations')).data.items,
    staleTime: 30_000,
  });
  const labels = {passed: 'Aprovado', failed: 'Divergência', inconclusive: 'Inconclusivo'};
  return <section className="space-y-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="font-display text-lg font-semibold">Avaliações com conversas reais</h2>
        <p className="text-sm text-gray-500">Comparação da resposta histórica com a reexecução do NSAgent e os caminhos de consulta.</p>
      </div>
      <Button variant="outline" size="sm" loading={query.isFetching} onClick={() => void query.refetch()}>Atualizar</Button>
    </div>
    {query.error && <p role="alert" className="text-sm text-red-600">{extractApiErrorMessage(query.error)}</p>}
    {query.isLoading && <p className="text-sm">Carregando avaliações…</p>}
    {query.data?.length === 0 && <p className="text-sm text-gray-500">Nenhuma avaliação executada para esta empresa.</p>}
    {query.data?.map(item => <article key={item.id} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={item.outcome === 'passed' ? 'success' : item.outcome === 'failed' ? 'warning' : 'default'}>
          {item.outcome ? labels[item.outcome] : item.status === 'running' ? 'Em execução' : 'Erro na execução'}
        </Badge>
        <span className="text-xs text-gray-500">Configuração {String(item.versions.configuration ?? '—')} · Modelo {String(item.versions.model ?? '—')}</span>
        {item.generativeExercised === false && <Badge variant="default">Fluxo determinístico</Badge>}
        {item.createdAt && <time className="text-xs text-gray-500" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString('pt-BR')}</time>}
      </div>
      <p className="font-medium">{item.question}</p>
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <div><p className="mb-1 text-xs text-gray-500">Resposta histórica</p><p className="whitespace-pre-wrap">{item.historicalReply || '—'}</p></div>
        <div><p className="mb-1 text-xs text-gray-500">Resposta em simulação</p><p className="whitespace-pre-wrap">{item.replayReply || '—'}</p></div>
      </div>
      {item.error && <p className="text-sm text-red-600">Execução incompleta: {item.error}</p>}
      {item.assessment && <p className="text-sm">{item.assessment.summary}</p>}
      {item.assessment?.findings.map((finding, index) => <div key={index} className="rounded border p-3 text-sm">
        <p className="font-medium">{finding.stage} · {finding.severity}</p>
        <p>{finding.explanation}</p><p className="mt-1 text-gray-500">Evidência: {finding.evidence}</p>
        <p className="mt-1">Correção sugerida: {finding.suggested_fix}</p>
      </div>)}
      {item.repair.instruction && <div className="rounded border p-3 text-sm">
        <p className="font-medium">Correção em teste: {item.repair.status === 'verified_candidate' ? 'passou neste caso; aguarda avaliação de regressão' : 'não aprovada'}</p>
        <p>{item.repair.instruction}</p>
      </div>}
      <details className="text-sm"><summary className="cursor-pointer">Consultas e decisões do agente</summary>
        <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded bg-gray-50 p-3 text-xs dark:bg-gray-950">{JSON.stringify({versions: item.versions, queries: item.tools, path: item.path}, null, 2)}</pre>
      </details>
    </article>)}
  </section>;
}
