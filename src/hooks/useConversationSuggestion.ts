import { agentService } from '@/services/agent.service';
import type { Message } from '@/types';
import { useQuery } from '@tanstack/react-query';

export function useConversationSuggestion(
  conversationId: string | null,
  customerId?: string,
  extraMessages?: Message[],
  enabled = true,
) {
  return useQuery({
    queryKey: ['ai-suggestion', conversationId, customerId, extraMessages?.length],
    queryFn: () =>
      agentService.suggestForConversation(conversationId!, customerId, extraMessages),
    enabled: !!conversationId && enabled,
    staleTime: 30_000,
  });
}
