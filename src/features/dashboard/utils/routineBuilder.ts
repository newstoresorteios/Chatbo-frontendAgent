import type { Product } from '@/types';
import type { DashboardStats } from '@/types';
import type { LeadScore, RoutineItem } from '@/features/dashboard/types';

export function buildRoutineItems(input: {
  stats: DashboardStats;
  leadScores: LeadScore[];
  retentionCustomersCount: number;
  products: Product[];
}): RoutineItem[] {
  return [
    ...(input.stats.waitingQueue > 0
      ? [
          {
            priority: 'Alta' as const,
            description: `Responder ${input.stats.waitingQueue} conversa(s) aguardando.`,
            origin: 'Central de Conversão',
            impact: 'Evita perda de conversão por atraso.',
            action: 'Abrir fila',
            href: '/atendimento',
          },
        ]
      : []),
    ...(input.leadScores.filter((l) => l.score >= 70).length > 0
      ? [
          {
            priority: 'Alta' as const,
            description: 'Revisar leads quentes detectados pelo scoring.',
            origin: 'Pontuação de leads',
            impact: 'Aumenta foco em oportunidades com maior intenção.',
            action: 'Ver leads',
          },
        ]
      : []),
    ...(input.retentionCustomersCount > 0
      ? [
          {
            priority: 'Media' as const,
            description: 'Reativar clientes com histórico de compra.',
            origin: 'Retenção',
            impact: 'Pode recuperar receita sem depender de novos leads.',
            action: 'Preparar abordagem',
          },
        ]
      : []),
    ...(input.products.some((p) => p.stock === 0)
      ? [
          {
            priority: 'Media' as const,
            description: 'Conferir produtos sem estoque antes de campanhas.',
            origin: 'Catálogo',
            impact: 'Reduz atrito comercial e promessas incorretas.',
            action: 'Ver catálogo',
          },
        ]
      : []),
    {
      priority: 'Baixa' as const,
      description: 'Perguntar ao ChatBô quais propostas priorizar esta semana.',
      origin: 'IA Comercial',
      impact: 'Ajuda a orientar a rotina de vendas.',
      action: 'Perguntar ao ChatBô',
    },
  ].slice(0, 6);
}
