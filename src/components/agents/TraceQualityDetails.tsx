import type { AgentTraceDetail } from '../../services/agentTrace.service';

const statuses: Record<string, string> = {
  approved: 'Aprovada', rejected: 'Reprovada', unavailable: 'Revisor indisponível',
  skipped: 'Não executada', matched: 'Confirmado', mismatch: 'Incompatível', unknown: 'Sem confirmação',
};

export function TraceQualityDetails({ trace }: { trace: AgentTraceDetail }) {
  const review = trace.responseCritique;
  const final = trace.finalResponseValidation;
  const requirements = Object.entries(trace.technicalRequirements ?? {});
  if (!Object.keys(review ?? {}).length && !Object.keys(final ?? {}).length && !requirements.length) return null;

  return (
    <section className="space-y-3 text-sm">
      <h2 className="font-semibold text-slate-900 dark:text-white">Qualidade da resposta</h2>
      {review && Object.keys(review).length > 0 && (
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <p className="font-medium">{statuses[String(review.review_status)] ?? 'Revisão registrada'}</p>
          <p className="mt-1 text-slate-500">Modo publicado: {String(review.configured_mode ?? '—')} · Modo aplicado: {String(review.mode ?? '—')}</p>
          {review.mode_reason ? <p className="mt-1 break-words text-xs text-slate-500">Motivo: {String(review.mode_reason)}</p> : null}
          {review.unavailable_reason ? <p className="mt-1 break-words text-amber-700 dark:text-amber-300">Falha de execução: {String(review.unavailable_reason)}</p> : null}
          <p className="mt-1 text-slate-500">Tentativas: {String(review.attempts ?? 0)} · Regenerou: {review.regenerated ? 'sim' : 'não'}</p>
        </div>
      )}
      {trace.llmBudget && Object.keys(trace.llmBudget).length > 0 && <p className="text-slate-500">Chamadas ao modelo: {trace.llmBudget.used_calls ?? '—'} de {trace.llmBudget.max_calls ?? '—'} · Limite {trace.llmBudget.enforce ? 'obrigatório' : 'em observação'}</p>}
      {requirements.length > 0 && <dl className="flex flex-wrap gap-3">{requirements.map(([field, value]) => <div key={field} className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800"><dt className="text-xs text-slate-500">{field === 'mechanism' ? 'Mecanismo' : field === 'crystal' ? 'Cristal' : field}</dt><dd>{value}</dd></div>)}</dl>}
      {(trace.technicalEvidence ?? []).map((evidence, index) => (
        <details key={`${String(evidence.product_id)}-${index}`} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <summary className="cursor-pointer">Produto {String(evidence.product_id ?? '—')} · {statuses[String(evidence.status)] ?? String(evidence.status ?? '—')}</summary>
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-500">{JSON.stringify(evidence.fields ?? evidence, null, 2)}</pre>
        </details>
      ))}
      {final && Object.keys(final).length > 0 && <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
        <p>Validação final: {final.passed ? 'aprovada' : 'encaminhada após falha'}{final.corrected ? ' · resposta corrigida' : ''}</p>
        <p className="mt-1 text-slate-500">Produtos apresentados: {Array.isArray(final.delivered_product_ids) && final.delivered_product_ids.length ? final.delivered_product_ids.join(', ') : 'nenhum'}</p>
      </div>}
      {Boolean(trace.avoidedCalls?.length) && <details><summary className="cursor-pointer text-slate-500">Chamadas evitadas ({trace.avoidedCalls?.length})</summary><ul className="mt-2 space-y-1 text-xs text-slate-500">{trace.avoidedCalls?.map((call, index) => <li key={index}>{String(call.reason ?? '')}</li>)}</ul></details>}
    </section>
  );
}
