import { useQuery } from '@tanstack/react-query';
import {
  channelsService,
  funnelService,
  campaignsService,
  chatbotService,
  integrationsService,
} from '@/services/platform.service';

export function useChannels() {
  return useQuery({ queryKey: ['channels'], queryFn: channelsService.getChannels });
}

export function useFunnel() {
  return useQuery({ queryKey: ['funnel'], queryFn: funnelService.getFunnel });
}

export function useCampaigns() {
  return useQuery({ queryKey: ['campaigns'], queryFn: campaignsService.getCampaigns });
}

export function useChatbots() {
  return useQuery({ queryKey: ['chatbots'], queryFn: chatbotService.getFlows });
}

export function useIntegrations() {
  return useQuery({ queryKey: ['integrations'], queryFn: integrationsService.getIntegrations });
}
