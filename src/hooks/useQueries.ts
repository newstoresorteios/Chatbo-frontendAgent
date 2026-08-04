import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { salesService } from '@/services/sales.service';
import { customersService, productsService, ordersService } from '@/services/data.service';
import { mercosService } from '@/services/mercos.service';
import { agentService } from '@/services/agent.service';
import { rankingsService } from '@/services/rankings.service';
import { systemService } from '@/services/system.service';
import { conversationsService } from '@/services/conversations.service';
import { agentRuntimeService } from '@/services/agentRuntime.service';
import type { ListParams } from '@/types';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboard,
  });
}

export function useSalesMetrics() {
  return useQuery({
    queryKey: ['sales-metrics'],
    queryFn: salesService.getMetrics,
  });
}

export function useSalesRankings(limit = 10) {
  return useQuery({
    queryKey: ['sales-rankings', limit],
    queryFn: () => rankingsService.getRankings(limit),
  });
}

export function useCustomers(params: ListParams = {}) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customersService.getCustomers(params),
  });
}

export function useCustomerDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersService.getCustomerDetail(id!),
    enabled: !!id,
  });
}

export function useProducts(params: ListParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsService.getProducts(params),
  });
}

export function useOrders(params: ListParams = {}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersService.getOrders(params),
  });
}

export function useMercosStatus() {
  return useQuery({
    queryKey: ['mercos', 'status'],
    queryFn: mercosService.getStatus,
  });
}

export function useMercosLogs() {
  return useQuery({
    queryKey: ['mercos', 'logs'],
    queryFn: mercosService.getLogs,
  });
}

export function useMercosHomologacao(enabled = true) {
  return useQuery({
    queryKey: ['mercos', 'homologacao'],
    queryFn: mercosService.getHomologacao,
    enabled,
    staleTime: 60_000,
  });
}

export function useAgentStatus() {
  return useQuery({
    queryKey: ['agent', 'status'],
    queryFn: agentService.getStatus,
  });
}

export function useSystemStatus() {
  return useQuery({
    queryKey: ['system', 'status'],
    queryFn: systemService.getStatus,
    staleTime: 60_000,
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: conversationsService.getConversations,
    refetchInterval: 5000,
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => conversationsService.getMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: conversationId ? 4000 : false,
  });
}

export function useConversationAgentContext(conversationId: string | null) {
  return useQuery({
    queryKey: ['conversation-agent-context', conversationId],
    queryFn: () => agentRuntimeService.getConversationAgentContext(conversationId!),
    enabled: !!conversationId,
    refetchInterval: conversationId ? 10_000 : false,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 501) return false;
      return failureCount < 2;
    },
  });
}
