import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Conversation } from '@/types';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface CommercialLead extends Conversation {
  score: number; label: string; stage: string; stageName: string;
  observedStages: string[]; reason: string; evidence: string; evidenceAt?: string;
  nextAction: string;
}
interface LeadPage { items: CommercialLead[]; total: number; hasMore: boolean; historyComplete: boolean; stages: Record<string, string> }

export function stageCounts(leads: CommercialLead[], stage: string) {
  return { current: leads.filter(l => l.stage === stage).length,
    historical: leads.filter(l => l.observedStages.includes(stage)).length };
}

export function useCommercialLeads() {
  const workspace = useWorkspace();
  return useQuery({
    queryKey: ['commercial-leads', workspace.id], enabled: !!workspace.user,
    staleTime: 0, refetchInterval: 60_000,
    refetchOnMount: 'always', refetchOnWindowFocus: true, refetchOnReconnect: true,
    queryFn: async ({ signal }) => {
      const leads = new Map<string, CommercialLead>();
      let complete = true;
      for (let n = 1; n <= 100; n++) {
        const { data } = await api.get<LeadPage>('/commercial/leads', { params: { page: n, page_size: 100 }, signal });
        data.items.forEach(l => leads.set(l.id, l));
        complete = complete && data.historyComplete;
        if (!data.hasMore) return { leads: [...leads.values()], stages: data.stages, complete };
      }
      throw new Error('Listagem muito extensa; não foi possível carregar todos os contatos.');
    },
  });
}
