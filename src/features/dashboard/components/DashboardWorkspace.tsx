import { SetupChecklist } from '@/components/dashboard/SetupChecklist';
import { Loading, Skeleton } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useChannels } from '@/hooks/usePlatform';
import {
  useAgentStatus,
  useConversations,
  useCustomers,
  useDashboard,
  useMercosStatus,
  useOrders,
  useProducts,
  useSalesMetrics,
  useSystemStatus,
} from '@/hooks/useQueries';
import { cn, formatCurrency, formatDateTime } from '@/utils';
import type { ChannelType } from '@/types';
import {
  BarChart3,
  Bot,
  Brain,
  CircleDollarSign,
  Gauge,
  GitBranch,
  Headphones,
  HeartHandshake,
  MessageSquare,
  Package,
  ShieldCheck,
  ShoppingCart,
  Target,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BusinessSummarySection } from './BusinessSummarySection';
import { AskNitrosSection } from './AskNitrosSection';
import { CommercialPerformanceSection } from './CommercialPerformanceSection';
import { CommercialRoutineSection } from './CommercialRoutineSection';
import { DashboardExecutiveHeader } from './DashboardExecutiveHeader';
import { DashboardInternalNav } from './DashboardInternalNav';
import { LeadScoringSection } from './LeadScoringSection';
import { LoyalCustomersSection } from './LoyalCustomersSection';
import { NitrosExecutiveSummary } from './NitrosExecutiveSummary';
import { OperationCredibilitySection } from './OperationCredibilitySection';
import { PerformanceRecommendationsSection } from './PerformanceRecommendationsSection';
import { PipelineHealthSection } from './PipelineHealthSection';
import { RevenueForecastSection } from './RevenueForecastSection';
import { RecentCustomersSection } from './RecentCustomersSection';
import { RetentionSection } from './RetentionSection';
import { ProductCatalogSection } from './ProductCatalogSection';
import { ServiceCapacitySection } from './ServiceCapacitySection';
import { useDashboardNavigation, usePresentationMode } from '../hooks';
import type { CommercialStatusFilter, DashboardNavigationItem, ExecutiveKpi, PeriodFilter, ProductSort, RoutineItem } from '../types';
import { daysSince, filterConversations, filterOrders, filterProducts, formatPercent, getCustomerAction, getCustomerStatus, hasBuyingIntent, periodCutoff, scoreConversation } from '../utils';

const CHANNEL_LABELS: Record<ChannelType, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  webchat: 'WebChat',
  telegram: 'Telegram',
  facebook: 'Facebook',
  sms: 'SMS',
  email: 'E-mail',
};

function buildChannelVolume(
  channels: { type: ChannelType; name: string; messagesToday: number }[] | undefined,
  conversations: { channel: ChannelType }[] | undefined,
): { name: string; value: number; type: ChannelType }[] {
  const fromChannels = (channels ?? [])
    .filter((c) => c.messagesToday > 0)
    .map((c) => ({ name: c.name, count: c.messagesToday, type: c.type }));

  const source = fromChannels.length
    ? fromChannels
    : Object.entries(
        (conversations ?? []).reduce<Record<string, number>>((acc, c) => {
          acc[c.channel] = (acc[c.channel] ?? 0) + 1;
          return acc;
        }, {}),
      ).map(([type, count]) => ({
        name: CHANNEL_LABELS[type as ChannelType] ?? type,
        count,
        type: type as ChannelType,
      }));

  const total = source.reduce((sum, item) => sum + item.count, 0);
  if (!total) return [];

  return source.map((item) => ({
    name: item.name,
    type: item.type,
    value: Math.max(1, Math.round((item.count / total) * 100)),
  }));
}

export function DashboardWorkspace() {
  const { user } = useAuth();
  const { data, isLoading, refetch, isFetching } = useDashboard();
  const { data: conversations } = useConversations();
  const { data: customersData } = useCustomers({ page: 1, pageSize: 100 });
  const { data: productsData } = useProducts({ page: 1, pageSize: 100 });
  const { data: ordersData } = useOrders({ page: 1, pageSize: 100 });
  const { data: channels } = useChannels();
  const { data: salesMetrics } = useSalesMetrics();
  const { data: agentStatus } = useAgentStatus();
  const { data: mercosStatus } = useMercosStatus();
  const { data: systemStatus } = useSystemStatus();

  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [productFilter, setProductFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommercialStatusFilter>('all');
  const [channelFilter, setChannelFilter] = useState('');
  const { presentationMode, togglePresentationMode } = usePresentationMode();
  const [productSort, setProductSort] = useState<ProductSort>('best');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { activeSection, isHidden: isDashboardNavHidden } = useDashboardNavigation(presentationMode);

  const customers = useMemo(() => customersData?.data ?? [], [customersData]);
  const products = useMemo(() => productsData?.data ?? [], [productsData]);
  const orders = useMemo(() => ordersData?.data ?? [], [ordersData]);
  const conversationList = useMemo(() => conversations ?? [], [conversations]);


  const cutoff = periodCutoff(period);

  const filteredConversations = useMemo(
    () => filterConversations(conversationList, { status: statusFilter, channel: channelFilter, customer: customerFilter, cutoff }),
    [channelFilter, conversationList, customerFilter, cutoff, statusFilter],
  );

  const filteredOrders = useMemo(() => filterOrders(orders, customerFilter, cutoff), [customerFilter, cutoff, orders]);

  const filteredProducts = useMemo(() => filterProducts(products, productFilter), [productFilter, products]);

  useEffect(() => {
    if (isDashboardNavHidden) setFiltersOpen(false);
  }, [isDashboardNavHidden]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-56 w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
        <Loading />
      </div>
    );
  }

  if (!data) return null;

  const { stats, conversationsChart, ordersChart, responseTimeChart } = data;
  const revenueSold = salesMetrics?.valorTotalVendido ?? filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const retainedRevenue = salesMetrics?.valorRetido ?? filteredOrders.filter((o) => o.status === 'delivered').reduce((sum, order) => sum + order.total, 0);
  const pipelineValue = salesMetrics?.pipelineValor ?? salesMetrics?.valorPipeline ?? 0;
  const ticketMedio = salesMetrics?.ticketMedio ?? (filteredOrders.length ? revenueSold / filteredOrders.length : 0);
  const retentionRate = salesMetrics?.taxaRetencao ?? (revenueSold > 0 ? (retainedRevenue / revenueSold) * 100 : 0);
  const conversionRate = salesMetrics?.taxaConversao ?? (stats.totalMessages ? (stats.totalOrders / stats.totalMessages) * 100 : 0);
  const opportunityCount =
    salesMetrics?.pipelineNegocios ??
    Math.max(0, stats.activeConversations + stats.waitingQueue + (salesMetrics?.funil ?? []).reduce((sum, step) => sum + step.quantidade, 0));
  const conservativeForecast = pipelineValue * 0.22;
  const probableRate = Math.max(0.28, Math.min(0.72, retentionRate / 100 || conversionRate / 100 || 0.35));
  const probableForecast = pipelineValue * probableRate;
  const optimisticForecast = pipelineValue * Math.max(probableRate, 0.55) + stats.waitingQueue * ticketMedio * 0.2;
  const channelVolume = buildChannelVolume(channels, filteredConversations);
  const hotLeadCount = filteredConversations.filter((conv) => conv.status === 'waiting' || hasBuyingIntent(conv.lastMessage)).length;
  const activeCustomers = customers.filter((c) => daysSince(c.lastContact) <= 30).length;
  const recurringCustomers = customers.filter((c) => c.ordersCount >= 2).length;
  const readiness = systemStatus?.readiness.percent ?? 0;

  const operationStatus =
    stats.waitingQueue === 0 ? 'Saudável' : stats.waitingQueue <= 5 ? 'Atenção' : 'Sobrecarregada';
  const operationTone: ExecutiveKpi['tone'] = operationStatus === 'Saudável' ? 'green' : operationStatus === 'Atenção' ? 'amber' : 'red';
  const pipelineHealth = Math.max(8, Math.min(100, Math.round((retentionRate + conversionRate + (pipelineValue > 0 ? 25 : 0)) / 2)));
  const pipelineTone: ExecutiveKpi['tone'] = pipelineHealth >= 70 ? 'green' : pipelineHealth >= 45 ? 'amber' : 'red';
  const gargalo = salesMetrics?.funil?.reduce((worst, step) => ((step.quedaPct ?? 0) > (worst.quedaPct ?? 0) ? step : worst), salesMetrics.funil[0]);

  const leadScores = filteredConversations
    .map((conv) => scoreConversation(conv, customers, filteredOrders))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const loyalCustomers = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent || b.ordersCount - a.ordersCount)
    .slice(0, 8)
    .map((customer) => {
      const status = getCustomerStatus(customer);
      return {
        customer,
        status,
        action: getCustomerAction(customer),
        tone: status === 'Em risco' ? 'red' as const : status === 'Fiel' ? 'green' as const : 'blue' as const,
      };
    });

  const recentCustomers = [...customers]
    .sort((a, b) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime())
    .slice(0, 8)
    .map((customer) => ({
      customer,
      status: customer.ordersCount > 0 ? 'Cliente ativo' : 'Novo lead',
      action: customer.ordersCount > 0 ? 'Sugerir recompra ou produto complementar.' : 'Qualificar necessidade e prazo de compra.',
    }));

  const retentionCustomers = customers
    .filter((c) => c.totalSpent > 0 && (daysSince(c.lastContact) > 45 || c.ordersCount >= 2))
    .sort((a, b) => daysSince(b.lastContact) - daysSince(a.lastContact) || b.totalSpent - a.totalSpent)
    .slice(0, 8)
    .map((customer) => {
      const daysWithoutPurchase = daysSince(customer.lastContact);
      const highRisk = daysWithoutPurchase > 90;
      return {
        customer,
        daysWithoutPurchase,
        risk: highRisk ? 'Alto' : 'Moderado',
        recommendedAction: highRisk ? 'Retomada de conversa com condição especial.' : 'Follow-up de recompra ou produto relacionado.',
        tone: highRisk ? 'red' as const : 'amber' as const,
      };
    });

  const productRows = [...filteredProducts]
    .sort((a, b) => {
      if (productSort === 'az') return a.name.localeCompare(b.name);
      if (productSort === 'worst' || productSort === 'idle') return a.stock - b.stock;
      if (productSort === 'revenue') return b.price * b.stock - a.price * a.stock;
      if (productSort === 'recent') return b.id.localeCompare(a.id);
      return b.stock - a.stock;
    })
    .slice(0, 12);

  const executiveDiagnosis =
    filteredOrders.length === 0 && filteredConversations.length === 0
      ? 'O ChatBô precisa de mais conversas, pedidos e clientes sincronizados para gerar previsões mais precisas.'
      : stats.waitingQueue > 0
        ? 'A fila de atendimento está aumentando. Priorize leads recentes para evitar perda de conversão.'
        : retentionRate >= 50
          ? 'Clientes recorrentes representam boa parte da receita. Uma campanha de recompra pode aumentar retenção.'
          : 'A operação tem espaço para melhorar conversão e retenção com follow-ups mais rápidos.';

  const mainRisk =
    stats.waitingQueue > 5
      ? 'Fila alta pode reduzir taxa de conversão.'
      : retentionRate < 35 && revenueSold > 0
        ? 'Retenção abaixo do ideal para clientes que já compraram.'
        : pipelineValue === 0
          ? 'Pipeline sem valor registrado limita previsões comerciais.'
          : 'Risco controlado no momento.';

  const mainOpportunity =
    hotLeadCount > 0
      ? `${hotLeadCount} lead(s) com sinal comercial para priorizar.`
      : recurringCustomers > 0
        ? `${recurringCustomers} cliente(s) recorrente(s) podem receber campanha de recompra.`
        : 'Aumentar captura e qualificação de conversas recentes.';

  const recommendedAction =
    stats.waitingQueue > 0
      ? 'Abrir a Central de Conversão e responder a fila com apoio do Assistente ChatBô.'
      : retentionCustomers.length > 0
        ? 'Criar uma abordagem de reativação para clientes com histórico de compra.'
        : 'Usar o ChatBô para revisar oportunidades e gerar propostas comerciais.';

  const expectedImpact =
    stats.waitingQueue > 0
      ? 'Menor tempo de resposta e maior chance de converter leads quentes.'
      : retentionCustomers.length > 0
        ? 'Recuperação de receita com clientes que já conhecem a empresa.'
        : 'Mais previsibilidade sobre pipeline e próximos passos.';

  const routineItems: RoutineItem[] = [
    ...(stats.waitingQueue > 0
      ? [
          {
            priority: 'Alta' as const,
            description: `Responder ${stats.waitingQueue} conversa(s) aguardando.`,
            origin: 'Central de Conversão',
            impact: 'Evita perda de conversão por atraso.',
            action: 'Abrir fila',
            href: '/atendimento',
          },
        ]
      : []),
    ...(leadScores.filter((l) => l.score >= 70).length > 0
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
    ...(retentionCustomers.length > 0
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
    ...(products.some((p) => p.stock === 0)
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

  const kpis: ExecutiveKpi[] = [
    {
      title: 'Receita vendida',
      value: formatCurrency(revenueSold),
      description: `${filteredOrders.length || salesMetrics?.quantidadeVendas || 0} pedido(s) no período selecionado.`,
      badge: revenueSold > 0 ? 'Receita ativa' : 'Sem vendas no período',
      tone: revenueSold > 0 ? 'green' : 'slate',
      icon: CircleDollarSign,
    },
    {
      title: 'Receita retida',
      value: formatCurrency(retainedRevenue),
      description: 'Receita concretizada em pedidos entregues ou retidos.',
      badge: `${formatPercent(retentionRate)} de retenção`,
      tone: retentionRate >= 50 ? 'green' : 'amber',
      icon: ShieldCheck,
    },
    {
      title: 'Pipeline em aberto',
      value: formatCurrency(pipelineValue),
      description: `${opportunityCount} oportunidade(s) detectada(s).`,
      badge: pipelineValue > 0 ? 'Em movimento' : 'Sem pipeline registrado',
      tone: pipelineValue > 0 ? 'blue' : 'slate',
      icon: GitBranch,
    },
    {
      title: 'Pedidos confirmados',
      value: salesMetrics?.quantidadeVendas ?? stats.totalOrders,
      description: 'Pedidos capturados no ChatBô e dados comerciais disponíveis.',
      badge: `${salesMetrics?.quantidadeEntregues ?? 0} entregues`,
      tone: 'blue',
      icon: ShoppingCart,
    },
    {
      title: 'Conversas ativas',
      value: stats.activeConversations,
      description: 'Oportunidades em atendimento agora.',
      badge: `${stats.waitingQueue} aguardando`,
      tone: stats.waitingQueue > 0 ? 'amber' : 'green',
      icon: MessageSquare,
    },
    {
      title: 'Leads aguardando',
      value: stats.waitingQueue,
      description: 'Conversas que precisam de resposta comercial.',
      badge: operationStatus,
      tone: operationTone,
      icon: Headphones,
    },
    {
      title: 'Clientes cadastrados',
      value: customersData?.total ?? stats.totalCustomers,
      description: `${activeCustomers} cliente(s) com interação recente.`,
      badge: `${recurringCustomers} recorrentes`,
      tone: 'blue',
      icon: Users,
    },
    {
      title: 'Produtos cadastrados',
      value: productsData?.total ?? stats.totalProducts,
      description: 'Catálogo comercial disponível para atendimento e propostas.',
      badge: `${products.filter((p) => p.stock > 0).length} com estoque`,
      tone: 'slate',
      icon: Package,
    },
    {
      title: 'Taxa de retenção',
      value: formatPercent(retentionRate),
      description: 'Estimativa baseada em receita vendida e retida.',
      badge: retentionRate >= 50 ? 'Boa retenção' : 'Revisar recompra',
      tone: retentionRate >= 50 ? 'green' : 'amber',
      icon: HeartHandshake,
    },
    {
      title: 'Performance da IA',
      value: `${stats.botResolved}%`,
      description: `${agentStatus?.online ? 'IA online' : 'IA sem status online'} no painel.`,
      badge: agentStatus?.model ?? (stats.aiOnline ? 'Online' : 'Local'),
      tone: stats.aiOnline || agentStatus?.online ? 'green' : 'amber',
      icon: Bot,
    },
  ];

  const nav: DashboardNavigationItem[] = [
    { label: 'Visão geral', id: 'visao-geral', icon: BarChart3 },
    { label: 'IA', id: 'ia', icon: Brain },
    { label: 'Pipeline', id: 'pipeline', icon: GitBranch },
    { label: 'Leads', id: 'leads', icon: Target },
    { label: 'Clientes', id: 'clientes', icon: Users },
    { label: 'Produtos', id: 'produtos', icon: Package },
    { label: 'Operação', id: 'operacao', icon: Gauge },
  ];

  const periodOptions = [
    { value: 'today', label: 'Hoje' },
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: 'month', label: 'Este mês' },
  ];
  const productOptions = [{ value: '', label: 'Produtos' }, ...products.map((p) => ({ value: p.id, label: p.name }))];
  const customerOptions = [{ value: '', label: 'Clientes' }, ...customers.map((c) => ({ value: c.id, label: c.name }))];
  const statusOptions = [
    { value: 'all', label: 'Status' },
    { value: 'active', label: 'Ativas' },
    { value: 'waiting', label: 'Aguardando' },
    { value: 'closed', label: 'Encerradas' },
  ];
  const channelOptions = [{ value: '', label: 'Canais' }, ...Object.entries(CHANNEL_LABELS).map(([value, label]) => ({ value, label }))];

  const recommendations = [
    {
      title: 'Responder leads em espera',
      reason: `${stats.waitingQueue} conversa(s) aguardando no momento.`,
      impact: 'Melhora velocidade comercial e reduz abandono.',
      priority: stats.waitingQueue > 0 ? 'Alta' : 'Baixa',
      action: 'Abrir Central de Conversão',
      href: '/atendimento',
    },
    {
      title: 'Reativar clientes parados',
      reason: `${retentionCustomers.length} cliente(s) com histórico podem esfriar.`,
      impact: 'Recupera receita com menor custo de aquisição.',
      priority: retentionCustomers.length > 0 ? 'Media' : 'Baixa',
      action: 'Ver lista de retenção',
    },
    {
      title: 'Promover produtos com baixa saída',
      reason: 'Produtos sem movimento precisam de abordagem comercial ou revisão.',
      impact: 'Aumenta giro de catálogo e qualidade das campanhas.',
      priority: products.length > 0 ? 'Media' : 'Baixa',
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

  return (
    <div className={cn('relative min-h-full', presentationMode && 'presentation-mode')}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/8" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-red-500/10 blur-3xl dark:bg-red-500/8" />
      </div>

      <div className="relative space-y-8">
        {!presentationMode && <SetupChecklist />}

        <DashboardExecutiveHeader
          firstName={user?.name?.split(' ')[0] ?? 'usuário'}
          operationStatus={operationStatus}
          operationTone={operationTone}
          presentationMode={presentationMode}
          isFetching={isFetching}
          onRefresh={() => refetch()}
          onTogglePresentation={togglePresentationMode}
        />

        <DashboardInternalNav
          items={nav}
          activeSection={activeSection}
          isHidden={isDashboardNavHidden}
          presentationMode={presentationMode}
          filtersOpen={filtersOpen}
          period={period}
          productFilter={productFilter}
          customerFilter={customerFilter}
          statusFilter={statusFilter}
          channelFilter={channelFilter}
          periodOptions={periodOptions}
          productOptions={productOptions}
          customerOptions={customerOptions}
          statusOptions={statusOptions}
          channelOptions={channelOptions}
          onPeriodChange={setPeriod}
          onProductChange={setProductFilter}
          onCustomerChange={setCustomerFilter}
          onStatusChange={setStatusFilter}
          onChannelChange={setChannelFilter}
          onToggleFilters={() => setFiltersOpen((value) => !value)}
        />

        <BusinessSummarySection metrics={kpis} presentationMode={presentationMode} />

        <NitrosExecutiveSummary
          diagnosis={executiveDiagnosis}
          recommendedAction={recommendedAction}
          expectedImpact={expectedImpact}
          mainRisk={mainRisk}
          mainOpportunity={mainOpportunity}
          agentOnline={Boolean(agentStatus?.online)}
          connectedChannels={channels?.filter((channel) => channel.connected).length ?? 0}
        />

        <RevenueForecastSection
          data={{
            conservative: conservativeForecast,
            probable: probableForecast,
            optimistic: optimisticForecast,
            soldRevenue: revenueSold,
            openPipeline: pipelineValue,
            probableRate,
          }}
        />

        <PipelineHealthSection
          data={{
            health: pipelineHealth,
            tone: pipelineTone,
            bottleneck: gargalo,
            openPipeline: pipelineValue,
            opportunityCount,
            conversionRate,
            atRiskCount: stats.waitingQueue,
            stages: salesMetrics?.funil ?? [],
          }}
        />

        <LeadScoringSection leads={leadScores} presentationMode={presentationMode} />

        <CommercialRoutineSection items={routineItems} presentationMode={presentationMode} />

        <ServiceCapacitySection
          data={{
            activeConversations: stats.activeConversations,
            waitingConversations: stats.waitingQueue,
            closedConversations: stats.closedConversations,
            averageResponseTime: stats.avgResponseTime,
            aiResolutionRate: stats.botResolved,
            status: operationStatus,
            tone: operationTone,
          }}
        />

        <LoyalCustomersSection customers={loyalCustomers} presentationMode={presentationMode} />

        <RecentCustomersSection customers={recentCustomers} presentationMode={presentationMode} />

        <RetentionSection customers={retentionCustomers} presentationMode={presentationMode} />

        <ProductCatalogSection products={productRows} sort={productSort} presentationMode={presentationMode} onSortChange={setProductSort} />

        <CommercialPerformanceSection data={{ ticketAverage: ticketMedio, orderCount: filteredOrders.length || salesMetrics?.quantidadeVendas || 0, soldRevenue: revenueSold, retainedRevenue, activeCustomers, recurringCustomers, conversionRate, evolutionPoints: ordersChart.length, conversationsChart, responseTimeChart }} />

        <AskNitrosSection conversationId={conversationList[0]?.id} customerId={conversationList[0]?.customerId} presentationMode={presentationMode} />

        <OperationCredibilitySection data={{ metrics: [{ label: 'IA', value: agentStatus?.online ? 'Online' : 'Offline', tone: agentStatus?.online ? 'green' : 'amber' }, { label: 'Modelo', value: agentStatus?.model ?? 'Sem status', tone: 'slate' }, { label: 'Canais conectados', value: channels?.filter((channel) => channel.connected).length ?? 0, tone: 'blue' }, { label: 'Prontidão', value: `${readiness}%`, tone: readiness >= 70 ? 'green' : 'amber' }, { label: 'Clientes sincronizados', value: mercosStatus?.syncedCustomers ?? systemStatus?.mercos.syncedCustomers ?? customers.length, tone: 'blue' }, { label: 'Produtos sincronizados', value: mercosStatus?.syncedProducts ?? systemStatus?.mercos.syncedProducts ?? products.length, tone: 'blue' }, { label: 'Pedidos sincronizados', value: mercosStatus?.syncedOrders ?? systemStatus?.mercos.syncedOrders ?? orders.length, tone: 'blue' }, { label: 'Última atualização', value: mercosStatus?.lastSync ? formatDateTime(mercosStatus.lastSync) : 'Sem sync', tone: 'slate' }], channelVolume, mercosStatus: mercosStatus?.connected || systemStatus?.mercos.configured ? 'Configurado' : 'Pendente', whatsappStatus: systemStatus?.whatsapp.connected ? 'Conectado' : 'Verificar', supabaseStatus: systemStatus?.supabase.ok ? 'Operacional' : 'Sem status', synchronizedDataStatus: mercosStatus?.connected ? 'Sim' : 'Parcial' }} />

        <PerformanceRecommendationsSection recommendations={recommendations} />
      </div>

    </div>
  );
}
