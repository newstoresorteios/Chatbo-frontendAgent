import { useAuth } from '@/contexts/AuthContext';
import { workspaceKeys, workspaceService, type CurrentWorkspace } from '@/services/workspace.service';
import type { User } from '@/types';
import { normalizeSessionUser, type AccountType, type OnboardingStatus, type WorkspaceRole } from '@/utils/sessionScope';
import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

interface WorkspaceScope {
  workspace?: CurrentWorkspace;
  settings?: CurrentWorkspace['settings'];
  id: string;
  name?: string;
  role: WorkspaceRole;
  onboardingStatus: OnboardingStatus;
  accountType: AccountType;
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetchWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceScope | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const scopedUser = user ? normalizeSessionUser(user) : null;

  const query = useQuery({
    queryKey: workspaceKeys.current(),
    queryFn: workspaceService.current,
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: 1,
  });

  const value = useMemo<WorkspaceScope>(() => {
    const workspace = query.data;

    if (!scopedUser) {
      return {
        id: 'legacy',
        name: undefined,
        role: 'member',
        onboardingStatus: 'complete',
        accountType: 'workspace_user',
        user: null,
        isLoading: query.isLoading,
        error: query.error,
        refetchWorkspace: () => {
          void query.refetch();
        },
      };
    }

    return {
      workspace,
      settings: workspace?.settings,
      id: workspace?.id ?? scopedUser.workspaceId ?? 'legacy',
      name: workspace?.name ?? scopedUser.workspaceName ?? scopedUser.company,
      role: workspace?.role ?? scopedUser.workspaceRole ?? 'member',
      onboardingStatus: workspace?.onboardingStatus ?? scopedUser.onboardingStatus ?? 'complete',
      accountType: workspace?.accountType ?? scopedUser.accountType ?? 'workspace_user',
      user: scopedUser,
      isLoading: query.isLoading,
      error: query.error,
      refetchWorkspace: () => {
        void query.refetch();
      },
    };
  }, [query, scopedUser]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
