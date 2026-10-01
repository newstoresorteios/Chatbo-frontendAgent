import type { HandoffSummary } from '../../types';

const goals: Record<string, string> = { find: 'Encontrar um produto', discover: 'Escolher um relógio', recommend: 'Receber recomendações', inspect: 'Consultar um produto', compare: 'Comparar produtos', buy: 'Comprar', after_sales: 'Acompanhar um pedido' };
const labels: Record<string, string> = { occasion: 'Ocasião', color: 'Cor', style: 'Estilo', material: 'Material', budget_min: 'Orçamento mínimo', budget_max: 'Orçamento máximo', subject_brand: 'Marca', subject_model: 'Modelo', subject_reference: 'Referência', delivery_deadline_text: 'Data desejada', delivery_mode: 'Modalidade' };
const pendingActions: Record<string, string> = { awaiting_shipping_zipcode: 'Obter o CEP para consultar o frete', awaiting_shipping_selection: 'Escolher o transporte', awaiting_order_customer_document: 'Confirmar o titular do pedido', awaiting_checkout_data: 'Completar os dados do pedido', awaiting_payment: 'Acompanhar o pagamento', awaiting_order_confirmation: 'Confirmar o pedido', show_images: 'Mostrar fotos do produto', send_product_link: 'Enviar o link do produto' };

export function HandoffSummaryCard({ summary }: { summary: HandoffSummary }) {
  if (!summary.consent?.confirmed) return null;
  const restrictions = Object.entries(summary.constraints ?? {}).filter(([key, value]) => labels[key] && (typeof value === 'string' || typeof value === 'number'));
  const display = (key: string, value: unknown) => key.startsWith('budget_') && typeof value === 'number'
    ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : value === 'ready_to_ship' ? 'Pronta entrega' : value === 'can_wait' ? 'Pode aguardar' : String(value);
  return <aside aria-label="Resumo para atendimento humano" className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 text-xs leading-relaxed text-gray-700 dark:text-gray-200">
    <p className="font-semibold text-amber-800 dark:text-amber-200">Resumo para atendimento · interno</p>
    {summary.objective && goals[summary.objective] && <p>Objetivo: {goals[summary.objective]}</p>}
    {summary.product_focus?.name && <p>Produto: {summary.product_focus.name}</p>}
    {summary.order_focus?.order_id && <p>Pedido: {summary.order_focus.order_id}{summary.order_focus.status ? ` · ${summary.order_focus.status}` : ''}</p>}
    {restrictions.length > 0 && <ul className="mt-1 list-disc pl-4">{restrictions.map(([key, value]) => <li key={key}>{labels[key]}: {display(key, value)}</li>)}</ul>}
    {summary.pending_action && pendingActions[summary.pending_action] && <p className="mt-1">Pendente: {pendingActions[summary.pending_action]}</p>}
    {summary.pending_question && <p>Última pergunta pendente: {summary.pending_question}</p>}
    {summary.delivery_requirement?.requires_date_confirmation && <p>Confirmar a data desejada; a chegada ainda depende de verificação.</p>}
    <p className="mt-1 text-slate-400">Encaminhamento autorizado pelo cliente.</p>
  </aside>;
}
