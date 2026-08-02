import type {
  AgentStatus,
  Campaign,
  Channel,
  ChartDataPoint,
  ChatbotFlow,
  Conversation,
  Customer,
  CustomerDetail,
  DashboardData,
  FunnelStage,
  Integration,
  Message,
  MercosLog,
  MercosStatus,
  Order,
  Product,
  User,
} from '@/types';

export const mockUser: User = {
  id: '1',
  name: 'Ana Silva',
  email: 'ana@tironitech.com',
  avatar: undefined,
  role: 'Administrador',
  company: 'Tironitech',
};

export const mockDashboard: DashboardData = {
  stats: {
    activeConversations: 47,
    closedConversations: 312,
    waitingQueue: 8,
    avgResponseTime: '1m 48s',
    aiOnline: true,
    campaignsSent: 1240,
    botResolved: 68,
    totalCustomers: 8,
    totalProducts: 16,
    totalOrders: 7,
    totalMessages: 120,
  },
  conversationsChart: [
    { name: 'Seg', conversas: 45, pedidos: 12, clientes: 8 },
    { name: 'Ter', conversas: 52, pedidos: 15, clientes: 11 },
    { name: 'Qua', conversas: 38, pedidos: 9, clientes: 6 },
    { name: 'Qui', conversas: 61, pedidos: 18, clientes: 14 },
    { name: 'Sex', conversas: 55, pedidos: 22, clientes: 10 },
    { name: 'Sáb', conversas: 28, pedidos: 7, clientes: 5 },
    { name: 'Dom', conversas: 15, pedidos: 3, clientes: 2 },
  ],
  ordersChart: [
    { name: 'Jan', conversas: 0, pedidos: 120, clientes: 45 },
    { name: 'Fev', conversas: 0, pedidos: 145, clientes: 52 },
    { name: 'Mar', conversas: 0, pedidos: 132, clientes: 48 },
    { name: 'Abr', conversas: 0, pedidos: 168, clientes: 61 },
    { name: 'Mai', conversas: 0, pedidos: 155, clientes: 55 },
    { name: 'Jun', conversas: 0, pedidos: 178, clientes: 63 },
  ],
  responseTimeChart: [
    { name: '08h', conversas: 1.2, pedidos: 0, clientes: 0 },
    { name: '10h', conversas: 2.1, pedidos: 0, clientes: 0 },
    { name: '12h', conversas: 3.5, pedidos: 0, clientes: 0 },
    { name: '14h', conversas: 2.8, pedidos: 0, clientes: 0 },
    { name: '16h', conversas: 2.3, pedidos: 0, clientes: 0 },
    { name: '18h', conversas: 1.9, pedidos: 0, clientes: 0 },
  ] as ChartDataPoint[],
};

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    customerId: 'cust1',
    customerName: 'Carlos Mendes',
    lastMessage: 'Preciso de um orçamento para 50 unidades',
    lastMessageAt: new Date(Date.now() - 120000).toISOString(),
    status: 'active',
    unreadCount: 2,
    channel: 'whatsapp',
    department: 'Comercial',
    protocol: 'PD-2024-8841',
    assignedTo: 'Ana Silva',
  },
  {
    id: 'c2',
    customerId: 'cust2',
    customerName: 'Mariana Costa',
    lastMessage: 'Obrigada pelo atendimento!',
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'closed',
    unreadCount: 0,
    channel: 'instagram',
    department: 'Suporte',
    protocol: 'PD-2024-8839',
  },
  {
    id: 'c3',
    customerId: 'cust3',
    customerName: 'Roberto Alves',
    lastMessage: 'Quando chega meu pedido #4521?',
    lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'waiting',
    unreadCount: 1,
    channel: 'whatsapp',
    department: 'Logística',
    protocol: 'PD-2024-8835',
  },
  {
    id: 'c4',
    customerId: 'cust4',
    customerName: 'Fernanda Lima',
    lastMessage: 'Vocês têm o produto XT-200 em estoque?',
    lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'active',
    unreadCount: 0,
    channel: 'webchat',
    department: 'Comercial',
    protocol: 'PD-2024-8820',
  },
  {
    id: 'c5',
    customerId: 'cust5',
    customerName: 'João Pereira',
    lastMessage: 'Gostaria de agendar uma visita técnica',
    lastMessageAt: new Date(Date.now() - 172800000).toISOString(),
    status: 'active',
    unreadCount: 3,
    channel: 'telegram',
    department: 'Suporte',
    protocol: 'PD-2024-8812',
  },
  {
    id: 'c6',
    customerId: 'cust6',
    customerName: 'Patricia Souza',
    lastMessage: 'Recebi a proposta, vou analisar',
    lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
    status: 'active',
    unreadCount: 0,
    channel: 'email',
    department: 'Comercial',
    protocol: 'PD-2024-8845',
  },
  {
    id: 'c7',
    customerId: 'cust1',
    customerName: 'Lucas Ferreira',
    lastMessage: 'Preciso de suporte urgente',
    lastMessageAt: new Date(Date.now() - 600000).toISOString(),
    status: 'waiting',
    unreadCount: 4,
    channel: 'facebook',
    department: 'Suporte',
    protocol: 'PD-2024-8847',
  },
];

export const mockMessages: Record<string, Message[]> = {
  c1: [
    {
      id: 'm1',
      conversationId: 'c1',
      content: 'Olá, bom dia! Preciso de um orçamento.',
      sender: 'customer',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      status: 'read',
    },
    {
      id: 'm2',
      conversationId: 'c1',
      content: 'Olá Carlos! Claro, posso ajudar. Qual produto você precisa?',
      sender: 'ai',
      timestamp: new Date(Date.now() - 540000).toISOString(),
      status: 'read',
    },
    {
      id: 'm3',
      conversationId: 'c1',
      content: 'Preciso do modelo Pro-X500, cerca de 50 unidades.',
      sender: 'customer',
      timestamp: new Date(Date.now() - 480000).toISOString(),
      status: 'read',
    },
    {
      id: 'm4',
      conversationId: 'c1',
      content: 'Vou verificar a disponibilidade e preparar o orçamento para você.',
      sender: 'agent',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: 'read',
    },
    {
      id: 'm5',
      conversationId: 'c1',
      content: 'Preciso de um orçamento para 50 unidades',
      sender: 'customer',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      status: 'delivered',
    },
  ],
  c2: [
    {
      id: 'm6',
      conversationId: 'c2',
      content: 'Seu pedido foi entregue com sucesso!',
      sender: 'agent',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'read',
    },
    {
      id: 'm7',
      conversationId: 'c2',
      content: 'Obrigada pelo atendimento!',
      sender: 'customer',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'read',
    },
  ],
  c3: [
    {
      id: 'm8',
      conversationId: 'c3',
      content: 'Quando chega meu pedido #4521?',
      sender: 'customer',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'sent',
    },
  ],
  c4: [
    {
      id: 'm9',
      conversationId: 'c4',
      content: 'Vocês têm o produto XT-200 em estoque?',
      sender: 'customer',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'read',
    },
    {
      id: 'm10',
      conversationId: 'c4',
      content: 'Sim! Temos 45 unidades disponíveis. Posso reservar para você?',
      sender: 'ai',
      timestamp: new Date(Date.now() - 85000000).toISOString(),
      status: 'read',
    },
  ],
  c5: [
    {
      id: 'm11',
      conversationId: 'c5',
      content: 'Gostaria de agendar uma visita técnica',
      sender: 'customer',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      status: 'delivered',
    },
  ],
};

export const mockCustomers: Customer[] = [
  {
    id: 'cust1',
    name: 'Carlos Mendes',
    email: 'carlos@empresa.com.br',
    phone: '(11) 98765-4321',
    company: 'Mendes Distribuidora',
    city: 'São Paulo, SP',
    ordersCount: 12,
    totalSpent: 45800,
    lastContact: new Date(Date.now() - 120000).toISOString(),
    synced: true,
    notes: 'Cliente VIP, preferência por entrega expressa.',
  },
  {
    id: 'cust2',
    name: 'Mariana Costa',
    email: 'mariana@loja.com',
    phone: '(21) 97654-3210',
    company: 'Costa Moda',
    city: 'Rio de Janeiro, RJ',
    ordersCount: 8,
    totalSpent: 23400,
    lastContact: new Date(Date.now() - 3600000).toISOString(),
    synced: true,
  },
  {
    id: 'cust3',
    name: 'Roberto Alves',
    email: 'roberto@tech.com',
    phone: '(31) 96543-2109',
    company: 'Alves Tech',
    city: 'Belo Horizonte, MG',
    ordersCount: 5,
    totalSpent: 15600,
    lastContact: new Date(Date.now() - 7200000).toISOString(),
    synced: false,
  },
  {
    id: 'cust4',
    name: 'Fernanda Lima',
    email: 'fernanda@shop.com',
    phone: '(41) 95432-1098',
    company: 'Lima Shop',
    city: 'Curitiba, PR',
    ordersCount: 15,
    totalSpent: 67200,
    lastContact: new Date(Date.now() - 86400000).toISOString(),
    synced: true,
  },
  {
    id: 'cust5',
    name: 'João Pereira',
    email: 'joao@industria.com',
    phone: '(51) 94321-0987',
    company: 'Pereira Indústria',
    city: 'Porto Alegre, RS',
    ordersCount: 22,
    totalSpent: 98500,
    lastContact: new Date(Date.now() - 172800000).toISOString(),
    synced: true,
    notes: 'Solicita visita técnica trimestral.',
  },
  {
    id: 'cust6',
    name: 'Patricia Souza',
    email: 'patricia@comercio.com',
    phone: '(85) 93210-9876',
    company: 'Souza Comércio',
    city: 'Fortaleza, CE',
    ordersCount: 3,
    totalSpent: 8900,
    lastContact: new Date(Date.now() - 259200000).toISOString(),
    synced: false,
  },
];

export const mockCustomerDetails: Record<string, CustomerDetail> = {
  cust1: {
    ...mockCustomers[0],
    orders: [
      {
        id: 'o1',
        number: 'TC-2024-001',
        customerId: 'cust1',
        customerName: 'Carlos Mendes',
        status: 'delivered',
        total: 12500,
        createdAt: '2024-05-15',
        items: 3,
      },
    ],
    purchasedProducts: [],
    lastService: new Date(Date.now() - 86400000).toISOString(),
  },
};

export const mockProducts: Product[] = [
  {
    id: 'p1',
    code: 'PRO-X500',
    name: 'Sensor Pro-X500',
    price: 289.9,
    stock: 120,
    category: 'Sensores',
    synced: true,
  },
  {
    id: 'p2',
    code: 'XT-200',
    name: 'Controlador XT-200',
    price: 459.0,
    stock: 45,
    category: 'Controladores',
    synced: true,
  },
  {
    id: 'p3',
    code: 'CB-100',
    name: 'Cabo Industrial CB-100',
    price: 89.5,
    stock: 350,
    category: 'Acessórios',
    synced: true,
  },
  {
    id: 'p4',
    code: 'MD-750',
    name: 'Módulo Digital MD-750',
    price: 1290.0,
    stock: 18,
    category: 'Módulos',
    synced: false,
  },
  {
    id: 'p5',
    code: 'RL-300',
    name: 'Relé Industrial RL-300',
    price: 175.0,
    stock: 89,
    category: 'Relés',
    synced: true,
  },
  {
    id: 'p6',
    code: 'PN-450',
    name: 'Painel PN-450',
    price: 2340.0,
    stock: 12,
    category: 'Painéis',
    synced: true,
  },
];

export const mockOrders: Order[] = [
  {
    id: 'o1',
    number: 'TC-2024-001',
    customerId: 'cust1',
    customerName: 'Carlos Mendes',
    status: 'delivered',
    total: 12500,
    createdAt: '2024-05-15',
    items: 3,
  },
  {
    id: 'o2',
    number: 'TC-2024-002',
    customerId: 'cust4',
    customerName: 'Fernanda Lima',
    status: 'processing',
    total: 8900,
    createdAt: '2024-06-20',
    items: 2,
  },
  {
    id: 'o3',
    number: 'TC-2024-003',
    customerId: 'cust3',
    customerName: 'Roberto Alves',
    status: 'shipped',
    total: 4521,
    createdAt: '2024-06-22',
    items: 1,
  },
  {
    id: 'o4',
    number: 'TC-2024-004',
    customerId: 'cust5',
    customerName: 'João Pereira',
    status: 'pending',
    total: 18700,
    createdAt: '2024-06-25',
    items: 5,
  },
  {
    id: 'o5',
    number: 'TC-2024-005',
    customerId: 'cust2',
    customerName: 'Mariana Costa',
    status: 'delivered',
    total: 3200,
    createdAt: '2024-06-26',
    items: 1,
  },
];

export const mockMercosStatus: MercosStatus = {
  connected: true,
  lastSync: new Date(Date.now() - 3600000).toISOString(),
  syncedProducts: 1247,
  syncedCustomers: 534,
  syncedOrders: 892,
};

export const mockMercosLogs: MercosLog[] = [
  {
    id: 'log1',
    type: 'products',
    status: 'success',
    message: '1.247 produtos sincronizados com sucesso',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'log2',
    type: 'customers',
    status: 'success',
    message: '534 clientes sincronizados com sucesso',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'log3',
    type: 'orders',
    status: 'success',
    message: '892 pedidos sincronizados com sucesso',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'log4',
    type: 'all',
    status: 'error',
    message: 'Falha na conexão com API Mercos - timeout',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const mockAgentStatus: AgentStatus = {
  online: true,
  model: 'gpt-4o',
  avgResponseTime: '1.2s',
  questionsAnswered: 3847,
};

export function getCustomerDetail(customerId: string): CustomerDetail {
  const customer = mockCustomers.find((c) => c.id === customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  return (
    mockCustomerDetails[customerId] ?? {
      ...customer,
      orders: mockOrders.filter((o) => o.customerId === customerId),
      purchasedProducts: mockProducts.slice(0, 3),
      lastService: customer.lastContact,
    }
  );
}

export const mockChannels: Channel[] = [
  { id: 'ch1', type: 'whatsapp', name: 'WhatsApp Comercial', connected: true, messagesToday: 342, phone: '+55 11 99999-0001', lastActivity: new Date().toISOString() },
  { id: 'ch2', type: 'instagram', name: 'Instagram @tironitech', connected: true, messagesToday: 89, lastActivity: new Date().toISOString() },
  { id: 'ch3', type: 'facebook', name: 'Facebook Messenger', connected: true, messagesToday: 56 },
  { id: 'ch4', type: 'telegram', name: 'Telegram Suporte', connected: true, messagesToday: 23 },
  { id: 'ch5', type: 'webchat', name: 'WebChat Site', connected: true, messagesToday: 112 },
  { id: 'ch6', type: 'sms', name: 'SMS Campanhas', connected: false, messagesToday: 0 },
  { id: 'ch7', type: 'email', name: 'E-mail Suporte', connected: true, messagesToday: 45 },
];

export const mockFunnel: FunnelStage[] = [
  {
    id: 's1',
    name: 'Lead',
    deals: [
      { id: 'd1', title: 'Proposta ERP', contact: 'Carlos Mendes', value: 45000, channel: 'whatsapp', stageId: 's1' },
      { id: 'd2', title: 'Consultoria TI', contact: 'Lucas Ferreira', value: 12000, channel: 'webchat', stageId: 's1' },
    ],
  },
  {
    id: 's2',
    name: 'Qualificação',
    deals: [
      { id: 'd3', title: 'Licenças SaaS', contact: 'Fernanda Lima', value: 28000, channel: 'instagram', stageId: 's2' },
    ],
  },
  {
    id: 's3',
    name: 'Proposta',
    deals: [
      { id: 'd4', title: 'Implantação WABA', contact: 'João Pereira', value: 18500, channel: 'whatsapp', stageId: 's3' },
    ],
  },
  {
    id: 's4',
    name: 'Negociação',
    deals: [
      { id: 'd5', title: 'Pacote Enterprise', contact: 'Patricia Souza', value: 92000, channel: 'email', stageId: 's4' },
    ],
  },
  {
    id: 's5',
    name: 'Fechado',
    deals: [
      { id: 'd6', title: 'Suporte Anual', contact: 'Mariana Costa', value: 8400, channel: 'telegram', stageId: 's5' },
    ],
  },
];

export const mockCampaigns: Campaign[] = [
  { id: 'cp1', name: 'Black Friday 2024', channel: 'whatsapp', status: 'completed', recipients: 2500, sent: 2480, opened: 1890 },
  { id: 'cp2', name: 'Boas-vindas novos leads', channel: 'whatsapp', status: 'running', recipients: 450, sent: 320, opened: 280 },
  { id: 'cp3', name: 'Pesquisa NPS', channel: 'sms', status: 'scheduled', recipients: 800, sent: 0, opened: 0, scheduledAt: '2024-07-01T10:00:00' },
  { id: 'cp4', name: 'Newsletter Junho', channel: 'email', status: 'draft', recipients: 1200, sent: 0, opened: 0 },
];

export const mockChatbots: ChatbotFlow[] = [
  { id: 'bot1', name: 'Triagem Inicial', active: true, triggers: 1240, resolved: 856, channel: 'whatsapp' },
  { id: 'bot2', name: 'FAQ Produtos', active: true, triggers: 890, resolved: 720, channel: 'webchat' },
  { id: 'bot3', name: 'Agendamento', active: false, triggers: 340, resolved: 210, channel: 'instagram' },
  { id: 'bot4', name: 'Pós-venda', active: true, triggers: 560, resolved: 445, channel: 'whatsapp' },
];

export const mockIntegrations: Integration[] = [
  { id: 'i1', name: 'HubSpot', category: 'crm', connected: true },
  { id: 'i2', name: 'RD Station', category: 'marketing', connected: true },
  { id: 'i3', name: 'Pipedrive', category: 'crm', connected: false },
  { id: 'i4', name: 'Salesforce', category: 'crm', connected: false },
  { id: 'i5', name: 'Omie', category: 'erp', connected: true },
  { id: 'i6', name: 'Shopify', category: 'ecommerce', connected: false },
  { id: 'i7', name: 'Bling ERP', category: 'erp', connected: true },
  { id: 'i8', name: 'Nuvemshop', category: 'ecommerce', connected: false },
];

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);
  return {
    data,
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
  };
}

export function filterBySearch<T>(
  items: T[],
  search: string,
  fields: (keyof T)[],
): T[] {
  if (!search.trim()) return items;
  const term = search.toLowerCase();
  return items.filter((item) =>
    fields.some((field) => String(item[field]).toLowerCase().includes(term)),
  );
}
