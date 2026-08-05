import type { User } from '@/types';

/** Perfis operacionais sem acesso a dados financeiros / gestão. */
const ATTENDANT_ROLES = new Set(['vendedor', 'user', 'seller', 'member']);

export function isAttendantRole(role?: string | null): boolean {
  return Boolean(role && ATTENDANT_ROLES.has(role));
}

export function defaultAppHome(user?: Pick<User, 'accountType' | 'role' | 'workspaceRole'> | null): string {
  if (user?.accountType === 'system_admin') return '/system/empresas';
  if (isAttendantRole(user?.workspaceRole) || isAttendantRole(user?.role)) {
    return '/atendimento';
  }
  return '/dashboard';
}
