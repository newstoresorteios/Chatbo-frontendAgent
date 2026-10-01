import { api } from '@/services/api';

export interface StoryReference {
  id: number;
  workspaceId: string;
  tenantId: string;
  name: string;
  url: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const storyReferenceService = {
  list: async () => (await api.get<{ items: StoryReference[]; total: number }>('/agents/current/story-references')).data,
  create: async (body: { name: string; url: string }) => (await api.post<StoryReference>('/agents/current/story-references', body)).data,
  update: async (id: number, body: Partial<Pick<StoryReference, 'name' | 'url' | 'active'>>) =>
    (await api.patch<StoryReference>(`/agents/current/story-references/${id}`, body)).data,
  remove: async (id: number) => { await api.delete(`/agents/current/story-references/${id}`); },
};
