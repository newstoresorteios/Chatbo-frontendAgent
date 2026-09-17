import { api } from './api';
import { USE_MOCK } from '@/config/runtime';
import {
  mockCustomers,
  mockProducts,
  mockOrders,
  paginate,
  filterBySearch,
  getCustomerDetail,
} from '@/data/mocks';
import { delay } from '@/utils';
import type {
  CommercialBiSnapshot,
  Customer,
  CustomerDetail,
  Product,
  Order,
  ChannelType,
  ListParams,
  PaginatedResponse,
} from '@/types';

function textValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
}

function numberValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function snapshotOrders(snapshot: CommercialBiSnapshot | null): Order[] {
  const allowedStatuses = new Set<Order['status']>([
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ]);
  const updatedAt = snapshot?.completedAt || snapshot?.createdAt || '';

  return (snapshot?.entities?.orders ?? []).map((row, index) => {
    const id = textValue(row.id, `chatbo-order-${index}`);
    const rawStatus = textValue(row.status, 'pending') as Order['status'];
    const itemDetails = Array.isArray(row.items)
      ? row.items.map((item) => ({
          productId: textValue(item?.productId),
          name: textValue(item?.name, 'Produto não informado'),
          quantity: numberValue(item?.quantity) || 1,
          price: numberValue(item?.price),
        }))
      : [];
    const evidence = row.conversationEvidence && typeof row.conversationEvidence === 'object'
      ? row.conversationEvidence as Record<string, unknown>
      : null;
    return {
      id,
      number: textValue(row.number, id),
      customerId: textValue(row.customerEmail, textValue(row.customerPhone)),
      customerName: textValue(row.customerName, 'Contato ChatBô'),
      status: allowedStatuses.has(rawStatus) ? rawStatus : 'pending',
      total: numberValue(row.total),
      createdAt: textValue(row.createdAt, updatedAt),
      items: numberValue(row.itemsCount)
        || itemDetails.reduce((total, item) => total + item.quantity, 0)
        || 1,
      itemDetails,
      attributionReason: textValue(row.attributionReason) || null,
      attributionLabel: textValue(row.attributionLabel),
      conversationEvidence: evidence
        ? {
            conversationId: textValue(evidence.conversationId),
            activeSessionId: textValue(evidence.activeSessionId) || undefined,
            protocol: textValue(evidence.protocol) || null,
            channel: textValue(evidence.channel, 'whatsapp') as ChannelType,
            lastMessageAt: textValue(evidence.lastMessageAt) || null,
            sessionCount: numberValue(evidence.sessionCount),
          }
        : null,
    };
  });
}

export const customersService = {
  getCustomers: async (params: ListParams = {}): Promise<PaginatedResponse<Customer>> => {
    const { page = 1, pageSize = 10, search = '' } = params;
    if (USE_MOCK) {
      await delay(500);
      let items = [...mockCustomers];
      if (search) {
        items = filterBySearch(items, search, ['name', 'email', 'phone', 'company', 'city']);
      }
      return paginate(items, page, pageSize);
    }
    const { data } = await api.get<PaginatedResponse<Customer>>('/clientes', { params });
    return data;
  },

  getCustomerDetail: async (id: string): Promise<CustomerDetail> => {
    if (USE_MOCK) {
      await delay(300);
      return getCustomerDetail(id);
    }
    const { data } = await api.get<CustomerDetail>(`/clientes/${id}`);
    return data;
  },
};

export const productsService = {
  getProducts: async (params: ListParams = {}): Promise<PaginatedResponse<Product>> => {
    const { page = 1, pageSize = 10, search = '', category } = params;
    if (USE_MOCK) {
      await delay(500);
      let items = [...mockProducts];
      if (search) {
        items = filterBySearch(items, search, ['code', 'name', 'category']);
      }
      if (category) {
        items = items.filter((p) => p.category === category);
      }
      return paginate(items, page, pageSize);
    }
    const { data } = await api.get<PaginatedResponse<Product>>('/produtos', { params });
    return data;
  },
};

export const ordersService = {
  getOrders: async (params: ListParams = {}): Promise<PaginatedResponse<Order>> => {
    const { page = 1, pageSize = 10, search = '', status } = params;
    const normalizedSearch = search.trim().replace(/^#/, '');
    if (USE_MOCK) {
      await delay(500);
      let items = [...mockOrders];
      if (normalizedSearch) {
        items = filterBySearch(items, normalizedSearch, ['number', 'customerName']);
      }
      if (status) {
        items = items.filter((o) => o.status === status);
      }
      return paginate(items, page, pageSize);
    }
    const { data } = await api.get<{ item: CommercialBiSnapshot | null }>('/commercial-bi/latest');
    let items = snapshotOrders(data.item ?? null);
    if (normalizedSearch) {
      items = filterBySearch(items, normalizedSearch, ['number', 'customerName']);
    }
    if (status) {
      items = items.filter((order) => order.status === status);
    }
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return paginate(items, page, pageSize);
  },
};
