import { mockOrders, mockProducts } from '@/data/mocks';
import type { AgentContext } from '@/types';
import { formatCurrency } from '@/utils';

export type ConversationIntent =
  | 'quote'
  | 'tracking'
  | 'stock'
  | 'technical_visit'
  | 'proposal_followup'
  | 'urgent_support'
  | 'closed_positive'
  | 'general';

export interface ConversationPlaybook {
  intent: ConversationIntent;
  insight: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
  summaryPoints: string[];
  replyHints: string[];
}

const PRO_X500 = mockProducts.find((p) => p.code === 'PRO-X500')!;
const XT200 = mockProducts.find((p) => p.code === 'XT-200')!;

export const CONVERSATION_PLAYBOOKS: Record<string, ConversationPlaybook> = {
  c1: {
    intent: 'quote',
    priority: 'high',
    insight: 'Carlos pede orçamento de 50× Pro-X500. Cliente VIP (12 pedidos). Estoque OK (120 un.). Fechar proposta hoje.',
    suggestion: `Olá Carlos! Confirmamos 120 unidades do Sensor Pro-X500 em estoque. Para 50 unidades, valor estimado ${formatCurrency(PRO_X500.price * 50 * 0.92)} com desconto volume. Envio proposta formal em até 2h — confirma CNPJ e endereço de entrega?`,
    summaryPoints: [
      'Cliente solicita orçamento para 50 unidades do Pro-X500',
      'Já houve triagem inicial pela IA — falta enviar proposta comercial',
      'Cliente VIP: 12 pedidos, R$ 45.800 em compras',
      'Próximo passo: formalizar proposta e reservar estoque por 48h',
    ],
    replyHints: [
      'Mencionar estoque disponível e prazo de 2h para proposta',
      'Oferecer desconto por volume (8% acima de 20 un.)',
      'Pedir CNPJ e endereço para agilizar faturamento',
    ],
  },
  c2: {
    intent: 'closed_positive',
    priority: 'low',
    insight: 'Conversa encerrada com feedback positivo. Oportunidade de NPS e upsell futuro.',
    suggestion: `Mariana, ficamos felizes em ajudar! Se puder, avalie nosso atendimento de 1 a 5. Qualquer nova necessidade, estamos à disposição.`,
    summaryPoints: [
      'Pedido entregue com sucesso',
      'Cliente satisfeita — conversa encerrada',
      'Bom momento para solicitar NPS/CSAT',
    ],
    replyHints: ['Agradecer e pedir avaliação', 'Oferecer canal para futuras compras'],
  },
  c3: {
    intent: 'tracking',
    priority: 'high',
    insight: 'Roberto aguarda pedido TC-2024-003 (#4521). Status: enviado. Risco de churn se demorar.',
    suggestion: `Olá Roberto! Seu pedido TC-2024-003 (${formatCurrency(4521)}) está em trânsito — previsão de entrega em 2 dias úteis. Envio agora o código de rastreio BR847291056BR. Precisa de prioridade na entrega?`,
    summaryPoints: [
      'Cliente pergunta quando chega pedido #4521',
      'Pedido TC-2024-003: status enviado, 1 item',
      'Aguardando na fila — responder com rastreio imediato',
    ],
    replyHints: ['Informar status em trânsito', 'Enviar código de rastreio', 'Oferecer escalar logística'],
  },
  c4: {
    intent: 'stock',
    priority: 'medium',
    insight: `Fernanda consulta XT-200. ${XT200.stock} un. disponíveis. Cliente recorrente (15 pedidos).`,
    suggestion: `Sim, Fernanda! Temos ${XT200.stock} unidades do Controlador XT-200 (${XT200.code}) por ${formatCurrency(XT200.price)}. Posso reservar ou enviar tabela com desconto para pedidos acima de 10 unidades?`,
    summaryPoints: [
      'Consulta de estoque do XT-200',
      'IA já confirmou disponibilidade — falta fechar reserva ou venda',
      'Cliente com histórico forte: 15 pedidos',
    ],
    replyHints: ['Confirmar estoque e preço', 'Oferecer reserva ou desconto volume'],
  },
  c5: {
    intent: 'technical_visit',
    priority: 'medium',
    insight: 'João Pereira solicita visita técnica. Nota no cadastro: visita trimestral. Cliente industrial.',
    suggestion: `Olá João! Agendo visita técnica — temos terça 14h ou quinta 10h. Informe endereço em ${'Porto Alegre, RS'} e equipamentos para enviarmos o técnico certo.`,
    summaryPoints: [
      'Solicitação de visita técnica',
      'Cliente com contrato de manutenção trimestral',
      '3 mensagens não lidas — priorizar agendamento',
    ],
    replyHints: ['Oferecer 2 horários', 'Pedir endereço e lista de equipamentos'],
  },
  c6: {
    intent: 'proposal_followup',
    priority: 'medium',
    insight: 'Patricia analisando proposta enviada. Momento ideal para follow-up comercial sem pressão.',
    suggestion: `Olá Patricia! Vi que recebeu nossa proposta. Posso esclarecer algum item ou ajustar condições de pagamento? Fico à disposição para fechar ainda esta semana.`,
    summaryPoints: [
      'Cliente recebeu proposta e está analisando',
      'Follow-up comercial recomendado em 24–48h',
      'Tom consultivo, sem pressionar',
    ],
    replyHints: ['Perguntar se há dúvidas', 'Oferecer flexibilidade de pagamento'],
  },
  c7: {
    intent: 'urgent_support',
    priority: 'high',
    insight: 'Lucas Ferreira com suporte URGENTE. 4 msgs não lidas. Protocolo PD-2024-8847. Escalar imediatamente.',
    suggestion: `Lucas, recebi sua solicitação urgente e já estou acionando a equipe técnica. Retorno em no máximo 15 minutos. Protocolo: PD-2024-8847.`,
    summaryPoints: [
      'Suporte urgente — 4 mensagens não lidas',
      'Canal Facebook, departamento Suporte',
      'Escalar para supervisor se não resolver em 30min',
    ],
    replyHints: ['Reconhecer urgência', 'Informar protocolo', 'Comprometer prazo de retorno'],
  },
};

export function getPlaybook(conversationId?: string): ConversationPlaybook | null {
  if (!conversationId) return null;
  return CONVERSATION_PLAYBOOKS[conversationId] ?? null;
}

export function detectIntentFromContext(ctx: AgentContext, message?: string): ConversationIntent {
  const playbook = getPlaybook(ctx.conversation?.id);
  if (playbook) return playbook.intent;

  const combined = [
    message ?? '',
    ctx.lastCustomerMessage ?? '',
    ...ctx.messages.filter((m) => m.sender === 'customer').map((m) => m.content),
  ].join(' ');

  const norm = combined.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

  if (norm.match(/urgente|suporte urgente|imediato/)) return 'urgent_support';
  if (norm.match(/orcamento|cotacao|preco|unidades/)) return 'quote';
  if (norm.match(/pedido|entrega|rastreio|chega|4521/)) return 'tracking';
  if (norm.match(/estoque|xt-200|pro-x500|disponivel/)) return 'stock';
  if (norm.match(/visita|tecnica|agendar/)) return 'technical_visit';
  if (norm.match(/proposta|analisar|recebi/)) return 'proposal_followup';
  if (norm.match(/obrigad|excelente|otimo atendimento/)) return 'closed_positive';

  return 'general';
}

export function getOrderForContext(ctx: AgentContext) {
  const customerOrders = ctx.customerDetail?.orders ?? [];
  if (customerOrders.length) return customerOrders[0];

  const orderNum = (ctx.lastCustomerMessage ?? '').match(/#?\d{4,}/)?.[0];
  if (orderNum) {
    return mockOrders.find((o) => o.number.includes(orderNum.replace('#', '')));
  }

  return mockOrders.find((o) => o.customerId === ctx.customer?.id);
}
