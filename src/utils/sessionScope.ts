import type { User } from '@/types';

export type AccountType = NonNullable<User['accountType']>;
export type WorkspaceRole = NonNullable<User['workspaceRole']>;
export type OnboardingStatus = NonNullable<User['onboardingStatus']>;

const WORKSPACE_ROLES: WorkspaceRole[] = ['owner', 'admin', 'supervisor', 'seller', 'member'];
const ONBOARDING_STATUSES: OnboardingStatus[] = ['pending', 'in_progress', 'complete'];

function readString(source: Record<string, unknown>, camelKey: string, snakeKey: string): string | undefined {
  const value = source[camelKey] ?? source[snakeKey];
  return typeof value === 'string' ? value : undefined;
}

function normalizeWorkspaceRole(role: string | undefined): WorkspaceRole {
  if (role && WORKSPACE_ROLES.includes(role as WorkspaceRole)) {
    return role as WorkspaceRole;
  }

  if (role === 'vendedor') return 'seller';
  if (role === 'supervisor') return 'supervisor';
  if (role === 'admin') return 'admin';

  return 'member';
}

export function normalizeSessionUser(user: User): User {
  const source = user as User & Record<string, unknown>;
  const accountType = readString(source, 'accountType', 'account_type');
  const workspaceId = readString(source, 'workspaceId', 'workspace_id');
  const workspaceName = readString(source, 'workspaceName', 'workspace_name');
  const workspaceRole = readString(source, 'workspaceRole', 'workspace_role');
  const onboardingStatus = readString(source, 'onboardingStatus', 'onboarding_status');

  return {
    ...user,
    accountType: accountType === 'system_admin' ? 'system_admin' : 'workspace_user',
    workspaceId: workspaceId ?? 'legacy',
    workspaceName: workspaceName ?? user.company,
    workspaceRole: normalizeWorkspaceRole(workspaceRole ?? user.workspaceRole ?? user.role),
    onboardingStatus: ONBOARDING_STATUSES.includes(onboardingStatus as OnboardingStatus)
      ? onboardingStatus as OnboardingStatus
      : 'complete',
  };
}

export function isSystemAdmin(user: User | null | undefined): boolean {
  return user?.accountType === 'system_admin';
}
