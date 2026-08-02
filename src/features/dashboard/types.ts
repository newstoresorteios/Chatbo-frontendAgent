import type { LucideIcon } from 'lucide-react';
import type { ChannelType, ChartDataPoint, Customer, Product, SalesFunnelStep } from '@/types';

export type PeriodFilter = 'today' | '7d' | '30d' | 'month';
export type CommercialStatusFilter = 'all' | 'active' | 'waiting' | 'closed';
export type ProductSort = 'best' | 'worst' | 'revenue' | 'idle' | 'recent' | 'az';
export type DashboardTone = 'blue' | 'red' | 'green' | 'amber' | 'slate';

export interface ExecutiveKpi {
  title: string;
  value: string | number;
  description: string;
  badge: string;
  tone: DashboardTone;
  icon: LucideIcon;
}

export interface LeadScore {
  id: string;
  customerName: string;
  channel: ChannelType;
  score: number;
  label: 'Quente' | 'Morno' | 'Frio' | 'Em risco' | 'Cliente fiel';
  reason: string;
  lastInteraction: string;
  nextAction: string;
}

export interface RoutineItem {
  priority: 'Alta' | 'Media' | 'Baixa';
  description: string;
  origin: string;
  impact: string;
  action: string;
  href?: string;
}

export interface DashboardNavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface DashboardSelectOption {
  value: string;
  label: string;
}

export interface DashboardExecutiveHeaderProps {
  firstName: string;
  operationStatus: string;
  operationTone: DashboardTone;
  presentationMode: boolean;
  isFetching: boolean;
  onRefresh: () => void;
  onTogglePresentation: () => void;
}

export interface DashboardInternalNavProps {
  items: DashboardNavigationItem[];
  activeSection: string;
  isHidden: boolean;
  presentationMode: boolean;
  filtersOpen: boolean;
  period: PeriodFilter;
  productFilter: string;
  customerFilter: string;
  statusFilter: CommercialStatusFilter;
  channelFilter: string;
  periodOptions: DashboardSelectOption[];
  productOptions: DashboardSelectOption[];
  customerOptions: DashboardSelectOption[];
  statusOptions: DashboardSelectOption[];
  channelOptions: DashboardSelectOption[];
  onPeriodChange: (value: PeriodFilter) => void;
  onProductChange: (value: string) => void;
  onCustomerChange: (value: string) => void;
  onStatusChange: (value: CommercialStatusFilter) => void;
  onChannelChange: (value: string) => void;
  onToggleFilters: () => void;
}

export interface BusinessSummarySectionProps {
  metrics: ExecutiveKpi[];
  presentationMode: boolean;
}
export interface NitrosExecutiveSummaryProps {
  diagnosis: string;
  recommendedAction: string;
  expectedImpact: string;
  mainRisk: string;
  mainOpportunity: string;
  agentOnline: boolean;
  connectedChannels: number;
}

export interface RevenueForecastData {
  conservative: number;
  probable: number;
  optimistic: number;
  soldRevenue: number;
  openPipeline: number;
  probableRate: number;
}

export interface RevenueForecastSectionProps {
  data: RevenueForecastData;
}

export interface PipelineHealthData {
  health: number;
  tone: DashboardTone;
  bottleneck?: SalesFunnelStep;
  openPipeline: number;
  opportunityCount: number;
  conversionRate: number;
  atRiskCount: number;
  stages: SalesFunnelStep[];
}

export interface PipelineHealthSectionProps {
  data: PipelineHealthData;
}
export interface LeadScoringSectionProps {
  leads: LeadScore[];
  presentationMode: boolean;
}

export interface CommercialRoutineSectionProps {
  items: RoutineItem[];
  presentationMode: boolean;
}

export interface ServiceCapacityData {
  activeConversations: number;
  waitingConversations: number;
  closedConversations: number;
  averageResponseTime: string;
  aiResolutionRate: number;
  status: string;
  tone: DashboardTone;
}

export interface ServiceCapacitySectionProps {
  data: ServiceCapacityData;
}

export interface LoyalCustomerItem {
  customer: Customer;
  status: string;
  action: string;
  tone: DashboardTone;
}

export interface LoyalCustomersSectionProps {
  customers: LoyalCustomerItem[];
  presentationMode: boolean;
}

export interface RecentCustomerItem {
  customer: Customer;
  status: string;
  action: string;
}

export interface RecentCustomersSectionProps {
  customers: RecentCustomerItem[];
  presentationMode: boolean;
}

export interface RetentionCustomerItem {
  customer: Customer;
  daysWithoutPurchase: number;
  risk: string;
  recommendedAction: string;
  tone: DashboardTone;
}

export interface RetentionSectionProps {
  customers: RetentionCustomerItem[];
  presentationMode: boolean;
}

export interface ProductCatalogSectionProps {
  products: Product[];
  sort: ProductSort;
  presentationMode: boolean;
  onSortChange: (sort: ProductSort) => void;
}

export interface CommercialPerformanceData {
  ticketAverage: number;
  orderCount: number;
  soldRevenue: number;
  retainedRevenue: number;
  activeCustomers: number;
  recurringCustomers: number;
  conversionRate: number;
  evolutionPoints: number;
  conversationsChart: ChartDataPoint[];
  responseTimeChart: ChartDataPoint[];
}

export interface CommercialPerformanceSectionProps {
  data: CommercialPerformanceData;
}

export interface AskNitrosSectionProps {
  conversationId?: string;
  customerId?: string;
  presentationMode: boolean;
}

export interface CredibilityMetric {
  label: string;
  value: string | number;
  tone: DashboardTone;
}

export interface ChannelVolumeItem {
  name: string;
  value: number;
  type: ChannelType;
}

export interface OperationCredibilityData {
  metrics: CredibilityMetric[];
  channelVolume: ChannelVolumeItem[];
  mercosStatus: string;
  whatsappStatus: string;
  supabaseStatus: string;
  synchronizedDataStatus: string;
}

export interface OperationCredibilitySectionProps {
  data: OperationCredibilityData;
}

export interface PerformanceRecommendation {
  title: string;
  reason: string;
  impact: string;
  priority: string;
  action: string;
  href?: string;
}

export interface PerformanceRecommendationsSectionProps {
  recommendations: PerformanceRecommendation[];
}
