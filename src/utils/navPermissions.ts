import type { LucideIcon } from 'lucide-react';
import type { WorkspaceRole } from '@/utils/sessionScope';

export type NavPermission = 'viewReports' | 'manageIntegrations' | 'managePlatform' | 'manageUsers';

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  permission?: NavPermission;
  roles?: WorkspaceRole[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export function filterNavSections(
  sections: NavSection[],
  can: (permission: string) => boolean,
  role?: WorkspaceRole,
): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const hasPermission = !item.permission || can(item.permission);
        const hasRole = !item.roles || Boolean(role && item.roles.includes(role));
        if (item.permission && item.roles) return hasPermission || hasRole;
        return hasPermission && hasRole;
      }),
    }))
    .filter((section) => section.items.length > 0);
}

export const SETTINGS_TAB_PERMISSIONS: Record<string, NavPermission | 'admin' | undefined> = {
  empresa: undefined,
  sistema: undefined,
  usuarios: 'manageUsers',
  permissoes: undefined,
  mercos: 'manageIntegrations',
  whatsapp: 'admin',
  openai: undefined,
  integracoes: 'manageIntegrations',
  notificacoes: undefined,
  seguranca: undefined,
  tema: undefined,
};

export function canAccessSettingsTab(
  tabId: string,
  can: (permission: string) => boolean,
  role: string,
): boolean {
  const rule = SETTINGS_TAB_PERMISSIONS[tabId];
  if (!rule) return true;
  if (rule === 'admin') return role === 'admin';
  return can(rule);
}
