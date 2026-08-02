import type { Conversation, Order, Product } from '@/types';
import type { CommercialStatusFilter, PeriodFilter } from '@/features/dashboard/types';
import {
  filterConversations,
  filterOrders,
  filterProducts,
  periodCutoff,
} from '@/features/dashboard/utils/dashboardFilters';
import { useMemo, useState } from 'react';

export function useDashboardFilters(input: {
  conversations: Conversation[];
  orders: Order[];
  products: Product[];
}) {
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [productFilter, setProductFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommercialStatusFilter>('all');
  const [channelFilter, setChannelFilter] = useState('');
  const cutoff = useMemo(() => periodCutoff(period), [period]);

  const filteredConversations = useMemo(
    () =>
      filterConversations(input.conversations, {
        cutoff,
        status: statusFilter,
        channel: channelFilter,
        customer: customerFilter,
      }),
    [channelFilter, customerFilter, cutoff, input.conversations, statusFilter],
  );

  const filteredOrders = useMemo(
    () => filterOrders(input.orders, customerFilter, cutoff),
    [customerFilter, cutoff, input.orders],
  );

  const filteredProducts = useMemo(
    () => filterProducts(input.products, productFilter),
    [input.products, productFilter],
  );

  return {
    period,
    setPeriod,
    productFilter,
    setProductFilter,
    customerFilter,
    setCustomerFilter,
    statusFilter,
    setStatusFilter,
    channelFilter,
    setChannelFilter,
    filteredConversations,
    filteredOrders,
    filteredProducts,
  };
}
