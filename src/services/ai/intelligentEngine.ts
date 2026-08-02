import { mockProducts } from '@/data/mocks';
import type { AgentContext, AgentMode, ConversationSuggestion } from '@/types';
import { formatCurrency } from '@/utils';
import {
  detectIntentFromContext,
  getOrderForContext,
  getPlaybook,
  type ConversationIntent,
} from './conversationPlaybooks';

function normalize(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function firstName(ctx: AgentContext) {
  return ctx.customer?.name.split(' ')[0] ?? ctx.conversation?.customerName.split(' ')[0] ?? '';
}

function findProductInText(text: string) {
  const norm = normalize(text);
  return mockProducts.find(
    (p) =>
      norm.includes(normalize(p.code)) ||
      norm.includes(normalize(p.name)) ||
      norm.includes(normalize(p.name.split(' ').pop() ?? '')),
  );
}

function extractQuantity(text: string): number | null {
  const match = text.match(/(\d+)\s*(unidades?|un\.?|pcs?|peças?)?/i);
  return match ? parseInt(match[1], 10) : null;
}

function getCombinedCustomerText(ctx: AgentContext, message?: string) {
  return [
    message ?? '',
    ctx.lastCustomerMessage ?? '',
    ...ctx.messages.filter((m) => m.sender === 'customer').slice(-4).map((m) => m.content),
  ].join(' ');
}

function sentimentLabel(ctx: AgentContext): string {
  const intent = detectIntentFromContext(ctx);
  const map: Record<ConversationIntent, string> = {
    quote: 'Comercial — intenção de compra',
    tracking: 'Ansioso — aguardando entrega',
    stock: 'Consultivo — avaliando produto',
    technical_visit: 'Operacional — precisa de suporte presencial',
    proposal_followup: 'Decisão — analisando proposta',
    urgent_support: 'Urgente — prioridade máxima',
    closed_positive: 'Satisfeito — conversa encerrada',
    general: 'Neutro — aguardando direcionamento',
  };
  return map[intent];
}

function summarizeConversation(ctx: AgentContext): string {
  const playbook = getPlaybook(ctx.conversation?.id);
  const points = playbook?.summaryPoints ?? [];

  if (points.length) {
    return `**Resumo — ${ctx.conversation?.customerName ?? ctx.customer?.name}**\n\n**Situação:** ${sentimentLabel(ctx)}\n\n${points.map((p) => `• ${p}`).join('\n')}\n\n**Canal:** ${ctx.conversation?.channel ?? '—'} | **Protocolo:** ${ctx.conversation?.protocol ?? '—'}\n\n**Próxima ação:** ${playbook?.replyHints[0] ?? 'Responder com objetividade e CTA claro.'}`;
  }

  const customerMsgs = ctx.messages.filter((m) => m.sender === 'customer');
  const topics = customerMsgs.map((m) => `• ${m.content}`).join('\n');

  return `**Resumo da conversa${ctx.customer ? ` — ${ctx.customer.name}` : ''}**\n\n**Tom detectado:** ${sentimentLabel(ctx)}\n\n**Demandas:**\n${topics || '• ' + (ctx.lastCustomerMessage ?? 'Sem mensagens')}\n\n**Perfil:** ${ctx.customer?.company ?? '—'} | ${ctx.customer?.ordersCount ?? 0} pedidos | ${formatCurrency(ctx.customer?.totalSpent ?? 0)}\n\n**Recomendação:** ${playbook?.replyHints[0] ?? 'Proponha próximo passo concreto em até 1 resposta.'}`;
}

function buildQuoteSuggestions(ctx: AgentContext, text: string): string {
  const product = findProductInText(text) ?? mockProducts[0];
  const qty = extractQuantity(text) ?? 50;
  const discount = qty >= 20 ? 0.08 : qty >= 10 ? 0.05 : 0;
  const total = product.price * qty * (1 - discount);
  const name = firstName(ctx);

  return `**3 sugestões para ${name || 'o cliente'}:**\n\n1️⃣ "Olá${name ? `, ${name}` : ''}! Temos **${product.stock} un.** do ${product.name} (${product.code}). Para ${qty} unidades: **${formatCurrency(total)}**${discount ? ` (desconto ${discount * 100}%)` : ''}. Envio proposta em 2h?"\n\n2️⃣ "Verifiquei estoque e prazo: entrega em 5 dias úteis para ${qty} unidades. Prefere pagamento à vista ou parcelado em 3x?"\n\n3️⃣ "Reservei as unidades por 48h. Confirma CNPJ e endereço para eu formalizar o orçamento agora."`;
}

function buildTrackingSuggestions(ctx: AgentContext): string {
  const order = getOrderForContext(ctx);
  const num = order?.number ?? 'TC-2024-003';
  const status = order?.status === 'delivered' ? 'entregue' : order?.status === 'shipped' ? 'em trânsito' : 'em separação';
  const name = firstName(ctx);

  return `**3 sugestões para ${name || 'o cliente'}:**\n\n1️⃣ "Olá${name ? `, ${name}` : ''}! Pedido **${num}** (${formatCurrency(order?.total ?? 4521)}) está **${status}**. Previsão: 2 dias úteis. Envio rastreio agora."\n\n2️⃣ "Acionei logística para priorizar seu pedido ${num}. Retorno em 30 min com atualização detalhada."\n\n3️⃣ "Peço desculpas pela espera. Já escalamos internamente — você receberá confirmação ainda hoje."`;
}

function suggestReplies(ctx: AgentContext, message?: string): string {
  const text = getCombinedCustomerText(ctx, message);
  const intent = detectIntentFromContext(ctx, message);
  const playbook = getPlaybook(ctx.conversation?.id);

  if (playbook && !message?.match(/sugest|resum|transcri/i)) {
    return `**Sugestão principal (contexto da conversa):**\n\n"${playbook.suggestion}"\n\n**Alternativas:**\n${playbook.replyHints.map((h, i) => `${i + 1}. ${h}`).join('\n')}`;
  }

  switch (intent) {
    case 'quote':
      return buildQuoteSuggestions(ctx, text);
    case 'tracking':
      return buildTrackingSuggestions(ctx);
    case 'stock': {
      const p = findProductInText(text) ?? mockProducts[1];
      return `**3 sugestões:**\n\n1️⃣ "Sim! **${p.stock} un.** do ${p.name} (${p.code}) por ${formatCurrency(p.price)}. Reservo para você?"\n\n2️⃣ "Temos estoque. Acima de 10 unidades, desconto de 8%. Envio tabela?"\n\n3️⃣ "Disponível agora. Entrega em 3–5 dias úteis. Qual quantidade precisa?"`;
    }
    case 'technical_visit':
      return `**3 sugestões:**\n\n1️⃣ "Agendo visita — terça 14h ou quinta 10h. Qual prefere?"\n\n2️⃣ "Nossa equipe atende ${ctx.customer?.city ?? 'sua região'}. Informe endereço e equipamentos."\n\n3️⃣ "Visita técnica inclusa no plano de suporte. Manutenção ou instalação nova?"`;
    case 'urgent_support':
      return `**3 sugestões (URGENTE):**\n\n1️⃣ "Recebi sua solicitação e já acionei a equipe. Retorno em 15 min. Protocolo: ${ctx.conversation?.protocol ?? 'PD-URG'}."\n\n2️⃣ "Prioridade máxima no seu caso. Supervisor notificado — aguarde contato imediato."\n\n3️⃣ "Entendo a urgência. Estou verificando agora e volto com solução concreta."`;
    case 'proposal_followup':
      return `**3 sugestões:**\n\n1️⃣ "Vi que está analisando a proposta. Posso esclarecer algum item?"\n\n2️⃣ "Se precisar, ajustamos condições de pagamento. Fico à disposição."\n\n3️⃣ "Qualquer dúvida sobre prazo ou especificação, me avise — respondo na hora."`;
    case 'closed_positive':
      return `**3 sugestões:**\n\n1️⃣ "Ficamos felizes em ajudar! Avalie nosso atendimento de 1 a 5 quando puder."\n\n2️⃣ "Obrigado pela confiança! Qualquer nova necessidade, estamos aqui."\n\n3️⃣ "Foi um prazer atender você. Até a próxima!"`;
    default:
      return `**3 sugestões:**\n\n1️⃣ "Olá${firstName(ctx) ? `, ${firstName(ctx)}` : ''}! Obrigado pelo contato. Como posso ajudar?"\n\n2️⃣ "Recebi sua mensagem e já estou verificando. Retorno em instantes."\n\n3️⃣ "Para agilizar: pode confirmar produto, pedido ou assunto principal?"`;
  }
}

function handleStockAndQuote(ctx: AgentContext, message: string): string | null {
  const text = getCombinedCustomerText(ctx, message);
  const product = findProductInText(text);
  if (!product && !normalize(message).match(/estoque|preco|orcamento|produto|catalogo/)) return null;

  const p = product ?? mockProducts[0];
  const qty = extractQuantity(text) ?? 1;
  const discount = qty >= 20 ? 0.08 : qty >= 10 ? 0.05 : 0;
  const finalTotal = p.price * qty * (1 - discount);

  return `📦 **Consulta ao catálogo**\n\n**${p.name}** (${p.code})\n• Estoque: **${p.stock} unidades**\n• Unitário: ${formatCurrency(p.price)}\n• Qtd. solicitada: ${qty}\n• Total: **${formatCurrency(finalTotal)}**${discount ? ` (−${discount * 100}% volume)` : ''}\n\n${p.stock >= qty ? '✅ Pode reservar e enviar proposta agora.' : '⚠️ Estoque parcial — sugira entrega fracionada ou encomenda (5 dias úteis).'}`;
}

function handleOrderTracking(ctx: AgentContext, message: string): string | null {
  const norm = normalize(getCombinedCustomerText(ctx, message));
  if (!norm.match(/pedido|entrega|rastreio|chega|4521|tc-/)) return null;

  const order = getOrderForContext(ctx);
  const num = order?.number ?? 'TC-2024-003';
  const tracking = `BR${847291056 + (order?.id.charCodeAt(1) ?? 0)}BR`;

  const statusLabels: Record<string, string> = {
    delivered: '✅ Entregue',
    shipped: '🚚 Em trânsito',
    processing: '📦 Em separação',
    pending: '⏳ Aguardando pagamento',
    cancelled: '❌ Cancelado',
  };
  const status = order?.status ?? 'shipped';

  return `📍 **Rastreamento — ${num}**\n\n• Cliente: ${ctx.customer?.name ?? ctx.conversation?.customerName}\n• Status: ${statusLabels[status] ?? status}\n• Valor: ${formatCurrency(order?.total ?? 4521)}\n• Itens: ${order?.items ?? 1}\n• Previsão: ${status === 'delivered' ? 'Entregue' : '2 dias úteis'}\n• Rastreio sugerido: \`${tracking}\`\n\n💡 Envie o código proativamente e ofereça prioridade se houver urgência.`;
}

function handleTranscription(ctx: AgentContext): string {
  const intent = detectIntentFromContext(ctx);
  const scripts: Record<ConversationIntent, string> = {
    quote: '"Preciso fechar hoje o orçamento das 50 unidades do Pro-X500. Consegue me mandar a proposta ainda hoje?"',
    tracking: '"Estou ligando sobre o pedido 4521. Preciso das peças até sexta para instalação. Podem verificar?"',
    stock: '"Vocês ainda têm o XT-200 disponível? Preciso de 10 unidades urgentes."',
    technical_visit: '"Gostaria de agendar visita técnica na planta. Temos 3 equipamentos parados."',
    proposal_followup: '"Recebi a proposta por e-mail. Estou analisando com o financeiro e retorno amanhã."',
    urgent_support: '"Preciso de suporte urgente! O sistema parou e estamos parados na produção."',
    closed_positive: '"Só passando para agradecer. Atendimento excelente, pedido chegou certinho."',
    general: '"Olá, boa tarde. Estou entrando em contato sobre um assunto comercial."',
  };

  return `🎙️ **Transcrição simulada:**\n\n${scripts[intent]}\n\n**Análise IA:**\n• Tom: ${sentimentLabel(ctx)}\n• Urgência: ${intent === 'urgent_support' || intent === 'tracking' ? 'Alta' : 'Média'}\n• Ação: ${getPlaybook(ctx.conversation?.id)?.replyHints[0] ?? 'Responder em até 30 min'}`;
}

function handleMagicText(ctx: AgentContext): string {
  const name = firstName(ctx) || 'cliente';
  const company = ctx.customer?.company ?? 'sua empresa';
  const intent = detectIntentFromContext(ctx);

  const closings: Record<ConversationIntent, string> = {
    quote: 'Preparamos condições especiais para sua cotação e retornaremos em breve com a proposta formal.',
    tracking: 'Já estamos verificando o status do seu pedido e retornaremos com o rastreio atualizado.',
    stock: 'Confirmamos disponibilidade e estamos preparando as melhores condições para você.',
    technical_visit: 'Nossa equipe técnica entrará em contato para confirmar data e horário da visita.',
    proposal_followup: 'Permanecemos à disposição para esclarecer qualquer ponto da proposta.',
    urgent_support: 'Sua solicitação foi escalada com prioridade e retornaremos em breve.',
    closed_positive: 'Agradecemos a confiança e ficamos à disposição para futuras demandas.',
    general: 'Analisamos sua solicitação e preparamos a melhor solução para atendê-lo com agilidade.',
  };

  return `✍️ **Texto sugerido (tom ChatBô):**\n\nPrezado(a) ${name},\n\nAgradecemos o contato e a confiança depositada na ${company}. ${closings[intent]}\n\nAtenciosamente,\nEquipe ChatBô`;
}

function handleDirectQuestion(ctx: AgentContext, message: string): string | null {
  const norm = normalize(message);

  if (norm.match(/quem e|qual cliente|dados do cliente/)) {
    if (!ctx.customer) return null;
    return `👤 **${ctx.customer.name}**\n\n• Empresa: ${ctx.customer.company}\n• ${ctx.customer.city}\n• ${ctx.customer.ordersCount} pedidos · ${formatCurrency(ctx.customer.totalSpent)}\n• Canal: ${ctx.conversation?.channel ?? '—'}\n${ctx.customer.notes ? `• Nota: ${ctx.customer.notes}` : ''}`;
  }

  if (norm.match(/protocolo|numero do protocolo/)) {
    return `Protocolo desta conversa: **${ctx.conversation?.protocol ?? 'N/A'}**`;
  }

  if (norm.match(/sentimento|tom|humor|urgencia/)) {
    return `**Análise da conversa:**\n• Tom: ${sentimentLabel(ctx)}\n• Prioridade: ${getPlaybook(ctx.conversation?.id)?.priority ?? 'medium'}\n• Intent: ${detectIntentFromContext(ctx)}`;
  }

  return null;
}

export function generateIntelligentReply(
  message: string,
  ctx: AgentContext,
  mode: AgentMode = 'copilot',
): string {
  const norm = normalize(message);

  if (norm.match(/resum|sumari/)) return summarizeConversation(ctx);
  if (norm.match(/sugest|sugira|resposta/)) return suggestReplies(ctx, message);
  if (norm.match(/transcri|audio/)) return handleTranscription(ctx);
  if (norm.match(/texto magic|tom de voz|profissional/)) return handleMagicText(ctx);

  const direct = handleDirectQuestion(ctx, message);
  if (direct) return direct;

  const stockReply = handleStockAndQuote(ctx, message);
  if (stockReply) return stockReply;

  const orderReply = handleOrderTracking(ctx, message);
  if (orderReply) return orderReply;

  if (norm.match(/estoque|produto|catalogo/)) {
    const list = mockProducts
      .slice(0, 6)
      .map((p) => `• **${p.code}** — ${p.name}: ${formatCurrency(p.price)} (${p.stock} un.)`)
      .join('\n');
    return `📋 **Catálogo:**\n\n${list}\n\nInforme código ou nome para orçamento detalhado.`;
  }

  const playbook = getPlaybook(ctx.conversation?.id);
  if (playbook && mode === 'copilot') {
    return `Com base na conversa ativa:\n\n**Análise:** ${playbook.insight}\n\n**Resposta sugerida:**\n"${playbook.suggestion}"\n\nPeça "sugira resposta" para ver mais alternativas ou "resuma conversa" para o resumo completo.`;
  }

  if (mode === 'agent') {
    if (norm.match(/\b(oi|ola|bom dia|boa tarde|boa noite|hello|hey)\b/)) {
      return `Olá! Sou o Assistente ChatBô. Consulto produtos, estoque, pedidos e histórico de clientes em tempo real. Posso resumir conversas, sugerir respostas ou montar orçamentos. Como posso ajudar?`;
    }
    return suggestReplies(ctx, message);
  }

  return suggestReplies(ctx, message);
}

export function generateConversationSuggestion(ctx: AgentContext): ConversationSuggestion {
  const playbook = getPlaybook(ctx.conversation?.id);
  if (playbook) {
    return {
      insight: playbook.insight,
      suggestion: playbook.suggestion,
      priority: playbook.priority,
    };
  }

  const last = ctx.lastCustomerMessage ?? ctx.conversation?.lastMessage ?? '';
  const intent = detectIntentFromContext(ctx);
  const name = firstName(ctx);

  const fallbacks: Record<ConversationIntent, ConversationSuggestion> = {
    quote: {
      insight: 'Intenção de compra detectada — montar orçamento.',
      suggestion: `Olá ${name}! Analisei sua solicitação e preparo o orçamento em até 2h. Confirma produto e quantidade?`,
      priority: 'high',
    },
    tracking: {
      insight: 'Cliente aguarda status de entrega.',
      suggestion: `Consultei seu pedido — está em trânsito, previsão 2 dias úteis. Envio rastreio agora.`,
      priority: 'high',
    },
    stock: {
      insight: 'Consulta de estoque.',
      suggestion: `Sim! Temos unidades disponíveis. Deseja reserva ou tabela para volume?`,
      priority: 'medium',
    },
    technical_visit: {
      insight: 'Solicitação de visita técnica.',
      suggestion: `Posso agendar visita terça (14h) ou quinta (10h). Informe endereço e equipamentos.`,
      priority: 'medium',
    },
    proposal_followup: {
      insight: 'Cliente analisando proposta — follow-up recomendado.',
      suggestion: `Olá ${name}! Posso esclarecer algum item da proposta ou ajustar condições?`,
      priority: 'medium',
    },
    urgent_support: {
      insight: 'Atendimento urgente — escalar imediatamente.',
      suggestion: `Recebi sua urgência. Retorno em 15 min. Protocolo: ${ctx.conversation?.protocol ?? 'PD-URG'}.`,
      priority: 'high',
    },
    closed_positive: {
      insight: 'Feedback positivo — solicitar NPS.',
      suggestion: `Obrigado pelo contato! Se puder, avalie nosso atendimento de 1 a 5.`,
      priority: 'low',
    },
    general: {
      insight: `Conversa via ${ctx.conversation?.channel ?? 'canal'}: "${last.slice(0, 50)}..."`,
      suggestion: `Olá ${name}! Obrigado pelo contato. Como posso ajudá-lo hoje?`,
      priority: 'low',
    },
  };

  return fallbacks[intent];
}
