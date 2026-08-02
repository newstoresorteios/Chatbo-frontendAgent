export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  company: string;
  accountType?: 'system_admin' | 'workspace_user';
  workspaceId?: string;
  workspaceName?: string;
  workspaceRole?: 'owner' | 'admin' | 'supervisor' | 'seller' | 'member';
  onboardingStatus?: 'pending' | 'in_progress' | 'complete';
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  company?: string;
}

export type ChannelType =
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'telegram'
  | 'webchat'
  | 'sms'
  | 'email';

export interface Channel {
  id: string;
  type: ChannelType;
  name: string;
  connected: boolean;
  messagesToday: number;
  lastActivity?: string;
  phone?: string;
  provider?: string;
  providerStatus?: string;
}

export interface DashboardStats {
  activeConversations: number;
  closedConversations: number;
  waitingQueue: number;
  avgResponseTime: string;
  aiOnline: boolean;
  campaignsSent: number;
  botResolved: number;
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  totalMessages: number;
}

export interface ChartDataPoint {
  name: string;
  conversas: number;
  pedidos: number;
  clientes: number;
}

export interface DashboardData {
  stats: DashboardStats;
  conversationsChart: ChartDataPoint[];
  ordersChart: ChartDataPoint[];
  responseTimeChart: ChartDataPoint[];
}

export interface SalesFunnelStep {
  id: string;
  label: string;
  quantidade: number;
  valor: number;
  conversaoPct: number;
  quedaPct?: number;
  tipo: string;
}

export interface SalesStatusBreakdown {
  status: string;
  label: string;
  quantidade: number;
  valor: number;
}

export interface SalesDayPoint {
  name: string;
  vendas: number;
  valor: number;
}

export interface SalesMetrics {
  quantidadeVendas: number;
  quantidadeConcluidas: number;
  quantidadeEntregues: number;
  valorTotalVendido: number;
  valorConcluido: number;
  volumeBruto: number;
  valorRetido: number;
  valorPipeline: number;
  valorCancelado: number;
  ticketMedio: number;
  taxaConversao: number;
  taxaRetencao: number;
  pipelineNegocios: number;
  pipelineValor: number;
  funil: SalesFunnelStep[];
  porStatus: SalesStatusBreakdown[];
  vendasPorDia: SalesDayPoint[];
}

export interface ProductRankingItem {
  id: string;
  code?: string;
  name: string;
  ordersCount: number;
  quantity: number;
  revenue: number;
}

export interface CustomerRankingItem {
  id: string;
  name: string;
  ordersCount: number;
  revenue: number;
  lastOrderAt?: string | null;
}

export interface SalesRankings {
  produtosMaisVendidos: ProductRankingItem[];
  produtosMenosVendidos: ProductRankingItem[];
  clientesMaisCompram: CustomerRankingItem[];
  clientesMenosCompram: CustomerRankingItem[];
  totals: {
    pedidos: number;
    produtosComVenda: number;
    clientesComPedido: number;
    produtosCatalogo: number;
    clientesCadastro: number;
  };
}

export type MessageSender = 'customer' | 'agent' | 'ai';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type ConversationStatus = 'active' | 'waiting' | 'closed';

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: MessageSender;
  timestamp: string;
  status: MessageStatus;
  aiSource?: 'openai' | 'intelligent';
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  status: ConversationStatus;
  unreadCount: number;
  channel: ChannelType;
  department?: string;
  protocol?: string;
  assignedTo?: string;
  assignedName?: string;
}

export interface FunnelStage {
  id: string;
  name: string;
  deals: FunnelDeal[];
}

export interface FunnelDeal {
  id: string;
  title: string;
  contact: string;
  value: number;
  channel: ChannelType;
  stageId: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: ChannelType;
  status: 'draft' | 'scheduled' | 'running' | 'completed';
  recipients: number;
  sent: number;
  opened: number;
  failed?: number;
  message?: string;
  scheduledAt?: string;
  dispatchedAt?: string;
  lastError?: string;
}

export interface ChatbotFlow {
  id: string;
  name: string;
  active: boolean;
  triggers: number;
  resolved: number;
  channel: ChannelType;
}

export interface Integration {
  id: string;
  name: string;
  category: 'crm' | 'erp' | 'ecommerce' | 'marketing';
  connected: boolean;
  logo?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  avatar?: string;
  ordersCount: number;
  totalSpent: number;
  lastContact: string;
  synced: boolean;
  notes?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  synced: boolean;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: number;
}

export interface MercosOrderStatusBreakdown {
  code: string;
  label: string;
  count: number;
  value: number;
}

export interface MercosStatus {
  connected: boolean;
  lastSync: string;
  syncedProducts: number;
  syncedCustomers: number;
  syncedOrders: number;
  environment?: 'sandbox' | 'production' | 'unknown';
  isProduction?: boolean;
  isSandbox?: boolean;
  baseUrlHost?: string;
  orderStatusBreakdown?: MercosOrderStatusBreakdown[];
  allOrdersProcessing?: boolean;
  retainedRevenue?: number;
}

export interface MercosHomologacao {
  prontoParaHomologacao: boolean;
  ambiente?: {
    environment?: string;
    isProduction?: boolean;
    isSandbox?: boolean;
    baseUrlHost?: string;
    configured?: boolean;
  };
  criteriosObrigatorios?: Record<string, boolean>;
  apisLeitura?: Record<string, boolean>;
  contagens?: Record<string, number>;
  erros?: Record<string, string>;
  documentacao?: string;
}

export interface MercosLog {
  id: string;
  type: 'products' | 'customers' | 'orders' | 'all';
  status: 'success' | 'error' | 'running' | 'info';
  message: string;
  timestamp: string;
}

export interface AgentStatus {
  online: boolean;
  model: string;
  avgResponseTime: string;
  questionsAnswered: number;
  openaiEnabled?: boolean;
  gptOnly?: boolean;
  intelligenceMode?: 'gpt' | 'local';
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AgentChatRequest {
  message: string;
  conversationId?: string;
  customerId?: string;
  mode?: AgentMode;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export type AgentMode = 'agent' | 'copilot' | 'suggestion';

export interface AgentContext {
  conversation?: Conversation;
  customer?: Customer;
  customerDetail?: CustomerDetail;
  messages: Message[];
  lastCustomerMessage?: string;
  productsCatalog: string;
  products?: Product[];
  orders?: Order[];
  relatedOrders?: Order[];
  recentOrders?: Order[];
  salesMetrics?: Record<string, unknown>;
  platformStats?: Record<string, unknown>;
}

export interface ConversationSuggestion {
  insight: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AgentChatResponse {
  reply: string;
  conversationId: string;
  source?: 'openai' | 'intelligent';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  category?: string;
}

export interface CustomerDetail extends Customer {
  orders: Order[];
  purchasedProducts: Product[];
  lastService: string;
}

export interface SystemChecklistItem {
  id: string;
  title: string;
  description: string;
  done: boolean;
  settingsTab: string;
  optional?: boolean;
}

export interface SystemStatus {
  supabase: {
    ok: boolean;
    message: string;
    users?: number;
    error?: string;
  };
  mercos: {
    configured: boolean;
    environment?: string;
    isProduction?: boolean;
    baseUrlHost?: string;
    lastSync?: string;
    syncedProducts: number;
    syncedCustomers: number;
    syncedOrders: number;
  };
  whatsapp: {
    configured: boolean;
    connected: boolean;
    provider?: string;
    webhookUrl?: string;
    displayPhone?: string;
    message?: string;
  };
  openai: {
    configured: boolean;
    mode: 'gpt' | 'local';
    model?: string;
    gptOnly?: boolean;
  };
  data: {
    customersWithPhone: number;
  };
  readiness: {
    completed: number;
    total: number;
    percent: number;
  };
  checklist: SystemChecklistItem[];
}
