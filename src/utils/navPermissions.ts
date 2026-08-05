import type { LucideIcon } from 'lucide-react';
import type { WorkspaceRole } from '@/utils/sessionScope';

export type NavPermission =
  | 'viewReports'
  | 'viewFinancial'
  | 'manageIntegrations'
  | 'managePlatform'
  | 'manageUsers';

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  group?: string;
  permission?: NavPermission;
  roles?: WorkspaceRole[];
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

function itemVisible(
  item: NavItem,
  can: (permission: string) => boolean,
  role?: WorkspaceRole,
): boolean {
  const hasPermission = !item.permission || can(item.permission);
  const hasRole = !item.roles || Boolean(role && item.roles.includes(role));
  if (item.permission && item.roles) return hasPermission || hasRole;
  return hasPermission && hasRole;
}

export function filterNavSections(
  sections: NavSection[],
  can: (permission: string) => boolean,
  role?: WorkspaceRole,
): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => {
          const children = item.children?.filter((child) => itemVisible(child, can, role));
          return {
            ...item,
            children: children && children.length > 0 ? children : undefined,
          };
        })
        .filter((item) => {
          if (item.children?.length) return true;
          return itemVisible(item, can, role);
        }),
    }))
    .filter((section) => section.items.length > 0);
}

export const SETTINGS_TAB_PERMISSIONS: Record<string, NavPermission | 'admin' | undefined> = {
  empresa: 'manageUsers',
  sistema: undefined,
  usuarios: 'manageUsers',
  permissoes: 'manageUsers',
  persona: 'managePlatform',
  mercos: 'manageIntegrations',
  whatsapp: 'admin',
  openai: undefined,
  integracoes: 'manageIntegrations',
  fontes: 'manageIntegrations',
  notificacoes: undefined,
  seguranca: undefined,
  tema: undefined,
  preferencias: undefined,
  perfil: undefined,
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
