import type { Customer, Product } from '@/types';
import type { DashboardStats } from '@/types';
import type { LeadScore, PerformanceRecommendation } from '@/features/dashboard/types';

export function buildRecommendations(input: {
  stats: DashboardStats;
  retentionCustomers: Customer[];
  products: Product[];
}): PerformanceRecommendation[] {
  return [
    {
      title: 'Responder leads em espera',
      reason: `${input.stats.waitingQueue} conversa(s) aguardando no momento.`,
      impact: 'Melhora velocidade comercial e reduz abandono.',
      priority: input.stats.waitingQueue > 0 ? 'Alta' : 'Baixa',
      action: 'Abrir Central de Conversão',
      href: '/atendimento',
    },
    {
      title: 'Reativar clientes parados',
      reason: `${input.retentionCustomers.length} cliente(s) com histórico podem esfriar.`,
      impact: 'Recupera receita com menor custo de aquisição.',
      priority: input.retentionCustomers.length > 0 ? 'Media' : 'Baixa',
      action: 'Ver lista de retenção',
    },
    {
      title: 'Promover produtos com baixa saída',
      reason: 'Produtos sem movimento precisam de abordagem comercial ou revisão.',
      impact: 'Aumenta giro de catálogo e qualidade das campanhas.',
      priority: input.products.length > 0 ? 'Media' : 'Baixa',
      action: 'Analisar catálogo',
    },
    {
      title: 'Usar IA para gerar propostas',
      reason: 'O Assistente ChatBô pode acelerar resposta e qualificação.',
      impact: 'Reduz tempo médio de atendimento.',
      priority: 'Media',
      action: 'Perguntar ao ChatBô',
    },
  ];
}

export function buildExecutiveInsights(input: {
  filteredOrdersCount: number;
  filteredConversationsCount: number;
  waitingQueue: number;
  retentionRate: number;
  revenueSold: number;
  pipelineValue: number;
  hotLeadCount: number;
  recurringCustomers: number;
  retentionCustomersCount: number;
}): {
  executiveDiagnosis: string;
  mainRisk: string;
  mainOpportunity: string;
  recommendedAction: string;
  expectedImpact: string;
} {
  const executiveDiagnosis =
    input.filteredOrdersCount === 0 && input.filteredConversationsCount === 0
      ? 'O ChatBô precisa de mais conversas, pedidos e clientes sincronizados para gerar previsões mais precisas.'
      : input.waitingQueue > 0
        ? 'A fila de atendimento está aumentando. Priorize leads recentes para evitar perda de conversão.'
        : input.retentionRate >= 50
          ? 'Clientes recorrentes representam boa parte da receita. Uma campanha de recompra pode aumentar retenção.'
          : 'A operação tem espaço para melhorar conversão e retenção com follow-ups mais rápidos.';

  const mainRisk =
    input.waitingQueue > 5
      ? 'Fila alta pode reduzir taxa de conversão.'
      : input.retentionRate < 35 && input.revenueSold > 0
        ? 'Retenção abaixo do ideal para clientes que já compraram.'
        : input.pipelineValue === 0
          ? 'Pipeline sem valor registrado limita previsões comerciais.'
          : 'Risco controlado no momento.';

  const mainOpportunity =
    input.hotLeadCount > 0
      ? `${input.hotLeadCount} lead(s) com sinal comercial para priorizar.`
      : input.recurringCustomers > 0
        ? `${input.recurringCustomers} cliente(s) recorrente(s) podem receber campanha de recompra.`
        : 'Aumentar captura e qualificação de conversas recentes.';

  const recommendedAction =
    input.waitingQueue > 0
      ? 'Abrir a Central de Conversão e responder a fila com apoio do Assistente ChatBô.'
      : input.retentionCustomersCount > 0
        ? 'Criar uma abordagem de reativação para clientes com histórico de compra.'
        : 'Usar o ChatBô para revisar oportunidades e gerar propostas comerciais.';

  const expectedImpact =
    input.waitingQueue > 0
      ? 'Menor tempo de resposta e maior chance de converter leads quentes.'
      : input.retentionCustomersCount > 0
        ? 'Recuperação de receita com clientes que já conhecem a empresa.'
        : 'Mais previsibilidade sobre pipeline e próximos passos.';

  return {
    executiveDiagnosis,
    mainRisk,
    mainOpportunity,
    recommendedAction,
    expectedImpact,
  };
}

export function countHotLeads(leadScores: LeadScore[]): number {
  return leadScores.filter((lead) => lead.label === 'Quente' || lead.label === 'Cliente fiel' || lead.label === 'Em risco').length;
}
