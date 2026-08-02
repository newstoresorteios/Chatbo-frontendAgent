import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  channelsService,
  campaignsService,
  chatbotService,
  integrationsService,
  funnelService,
} from '@/services/platform.service';

export function usePlatformMutations() {
  const qc = useQueryClient();
  const invalidate = {
    channels: () => qc.invalidateQueries({ queryKey: ['channels'] }),
    campaigns: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
    chatbots: () => qc.invalidateQueries({ queryKey: ['chatbots'] }),
    integrations: () => qc.invalidateQueries({ queryKey: ['integrations'] }),
    funnel: () => qc.invalidateQueries({ queryKey: ['funnel'] }),
  };

  return {
    connectChannel: useMutation({
      mutationFn: ({ type, name }: { type: Parameters<typeof channelsService.connect>[0]; name: string }) =>
        channelsService.connect(type, name),
      onSuccess: invalidate.channels,
    }),
    updateChannel: useMutation({
      mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof channelsService.update>[1] }) =>
        channelsService.update(id, patch),
      onSuccess: invalidate.channels,
    }),
    toggleChannel: useMutation({
      mutationFn: channelsService.toggle,
      onSuccess: invalidate.channels,
    }),
    createCampaign: useMutation({
      mutationFn: campaignsService.create,
      onSuccess: invalidate.campaigns,
    }),
    dispatchCampaign: useMutation({
      mutationFn: campaignsService.dispatch,
      onSuccess: invalidate.campaigns,
    }),
    createChatbot: useMutation({
      mutationFn: chatbotService.create,
      onSuccess: invalidate.chatbots,
    }),
    toggleChatbot: useMutation({
      mutationFn: chatbotService.toggle,
      onSuccess: invalidate.chatbots,
    }),
    updateChatbot: useMutation({
      mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof chatbotService.update>[1] }) =>
        chatbotService.update(id, patch),
      onSuccess: invalidate.chatbots,
    }),
    toggleIntegration: useMutation({
      mutationFn: integrationsService.toggle,
      onSuccess: invalidate.integrations,
    }),
    moveDeal: useMutation({
      mutationFn: ({ dealId, stageId }: { dealId: string; stageId: string }) =>
        funnelService.moveDeal(dealId, stageId),
      onSuccess: invalidate.funnel,
    }),
    syncFunnel: useMutation({
      mutationFn: funnelService.syncFromMercos,
      onSuccess: () => {
        invalidate.funnel();
        qc.invalidateQueries({ queryKey: ['sales-metrics'] });
      },
    }),
  };
}
