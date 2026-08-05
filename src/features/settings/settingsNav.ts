import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Building2,
  DatabaseZap,
  IdCard,
  Key,
  Link,
  MessageCircle,
  Palette,
  Server,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Users,
} from 'lucide-react';
import type { NavPermission } from '@/utils/navPermissions';
import type { WorkspaceRole } from '@/utils/sessionScope';

export type SettingsTabGroup = 'workspace' | 'company' | 'integrations' | 'system';

export interface SettingsNavItem {
  id: string;
  label: string;
  group: SettingsTabGroup;
  icon: LucideIcon;
  permission?: NavPermission;
  roles?: WorkspaceRole[];
  systemAdminOnly?: boolean;
}

export const SETTINGS_GROUP_LABELS: Record<SettingsTabGroup, string> = {
  workspace: 'Workspace',
  company: 'Empresa',
  integrations: 'Canais e dados',
  system: 'Sistema global',
};

/** Tabs de Configurações (Persona fica no menu Agente → /persona). */
export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  { id: 'perfil', label: 'Meu perfil', group: 'workspace', icon: IdCard },
  { id: 'preferencias', label: 'Preferências', group: 'workspace', icon: SlidersHorizontal },
  { id: 'notificacoes', label: 'Notificações', group: 'workspace', icon: Bell },
  { id: 'seguranca', label: 'Segurança', group: 'workspace', icon: Key },
  { id: 'tema', label: 'Aparência', group: 'workspace', icon: Palette },
  { id: 'empresa', label: 'Minha empresa', group: 'company', icon: Building2, roles: ['owner', 'admin'], permission: 'manageUsers' },
  { id: 'usuarios', label: 'Equipe e acessos', group: 'company', icon: Users, roles: ['owner', 'admin'], permission: 'manageUsers' },
  { id: 'permissoes', label: 'Permissões', group: 'company', icon: Shield, roles: ['owner', 'admin'], permission: 'manageUsers' },
  { id: 'fontes', label: 'Canais e fontes de dados', group: 'integrations', icon: DatabaseZap, permission: 'manageIntegrations' },
  { id: 'integracoes', label: 'Integrações', group: 'integrations', icon: Link, permission: 'manageIntegrations' },
  { id: 'mercos', label: 'Atualização de catálogo', group: 'integrations', icon: Settings, permission: 'manageIntegrations' },
  { id: 'sistema', label: 'Status técnico do sistema', group: 'system', icon: Server, systemAdminOnly: true },
  { id: 'openai', label: 'Configuração OpenAI', group: 'system', icon: Sparkles, systemAdminOnly: true },
  { id: 'whatsapp', label: 'Credenciais brutas do WhatsApp', group: 'system', icon: MessageCircle, systemAdminOnly: true },
];

export function settingsTabPath(tabId: string): string {
  return `/configuracoes?tab=${tabId}`;
}

export function filterSettingsNavItems(
  items: SettingsNavItem[],
  can: (permission: string) => boolean,
  role?: WorkspaceRole,
  isSystemAdmin = false,
): SettingsNavItem[] {
  return items.filter((item) => {
    if (item.systemAdminOnly && !isSystemAdmin) return false;
    const hasPermission = !item.permission || can(item.permission);
    const hasRole = !item.roles || Boolean(role && item.roles.includes(role));
    if (item.permission && item.roles) return hasPermission || hasRole;
    if (item.permission) return hasPermission;
    if (item.roles) return hasRole;
    return true;
  });
}
