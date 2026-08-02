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
  Customer,
  CustomerDetail,
  Product,
  Order,
  ListParams,
  PaginatedResponse,
} from '@/types';

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
    if (USE_MOCK) {
      await delay(500);
      let items = [...mockOrders];
      if (search) {
        items = filterBySearch(items, search, ['number', 'customerName']);
      }
      if (status) {
        items = items.filter((o) => o.status === status);
      }
      return paginate(items, page, pageSize);
    }
    const { data } = await api.get<PaginatedResponse<Order>>('/pedidos', { params });
    return data;
  },
};
