export type CommerceSource = 'mercos' | 'manual' | 'custom' | 'future';

export interface CatalogItem {
  id: string;
  externalId?: string;
  source?: CommerceSource;
  name: string;
  description?: string;
  category?: string;
  price: number;
  promotionalPrice?: number;
  stock?: number;
  sku?: string;
  images?: string[];
  metadata?: Record<string, unknown>;
}

export interface CommerceCustomer {
  id: string;
  externalId?: string;
  source?: CommerceSource;
  name: string;
  email?: string;
  phone?: string;
  metadata?: Record<string, unknown>;
}

export interface CommerceOrderItem {
  id?: string;
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CommerceOrder {
  id: string;
  externalId?: string;
  source?: CommerceSource;
  customerId?: string;
  status: string;
  total: number;
  items?: CommerceOrderItem[];
  metadata?: Record<string, unknown>;
}
