import { businessService } from '@/features/business/services/business.service';
import type { BusinessProfileDraft } from '@/features/business/types';
import type { CompanySettings } from '@/services/settings.service';
import { workspaceKeys } from '@/services/workspace.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const businessProfileQueryKey = ['settings', 'empresa'] as const;
export const settingsKeys = {
  business: () => businessProfileQueryKey,
};

export function useBusinessProfile() {
  return useQuery({
    queryKey: businessProfileQueryKey,
    queryFn: businessService.getProfile,
  });
}

export function useSaveBusinessProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ draft, current }: { draft: BusinessProfileDraft; current?: CompanySettings }) =>
      businessService.saveProfile(draft, current),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessProfileQueryKey });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.current() });
    },
  });
}

export function useSaveBusinessCompanyStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ draft }: { draft: BusinessProfileDraft }) => businessService.saveCompanyStep(draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessProfileQueryKey });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.current() });
    },
  });
}
