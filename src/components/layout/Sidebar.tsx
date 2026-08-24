import { Logo } from '@/components/layout/Logo';
import { cn } from '@/utils';
import { filterNavSections, type NavItem, type NavSection } from '@/utils/navPermissions';
import {
  filterSettingsNavItems,
  SETTINGS_GROUP_LABELS,
  SETTINGS_NAV_ITEMS,
  settingsTabPath,
  type SettingsTabGroup,
} from '@/features/settings/settingsNav';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Bot,
  Brain,
  ChevronDown,
  ChevronLeft,
  DollarSign,
  Flame,
  Gauge,
  GitBranch,
  GraduationCap,
  Headphones,
  LogOut,
  Megaphone,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useUnclaimedConversationAlert } from '@/hooks/useUnclaimedConversationAlert';
import { isSystemAdmin } from '@/utils/sessionScope';

function buildNavSections(settingsChildren: NavItem[]): NavSection[] {
  return [
    { title: 'OPERAÇÃO', items: [
      { to: '/dashboard', icon: Gauge, label: 'Painel Comercial', permission: 'viewFinancial', roles: ['owner', 'admin', 'supervisor'] },
      { to: '/atendimento', icon: Headphones, label: 'Central de Conversão' },
      { to: '/contatos', icon: Users, label: 'Clientes' },
      { to: '/produtos', icon: Package, label: 'Produtos' },
      { to: '/pedidos', icon: ShoppingCart, label: 'Pedidos', permission: 'viewFinancial', roles: ['owner', 'admin', 'supervisor'] },
      { to: '/funil', icon: GitBranch, label: 'Funil de Vendas', permission: 'viewFinancial', roles: ['owner', 'admin', 'supervisor'] },
    ] },
    { title: 'AGENTE', items: [
      { to: '/copiloto', icon: Sparkles, label: 'Assistente ChatBô', permission: 'managePlatform', roles: ['owner', 'admin', 'supervisor'] },
      { to: '/robo', icon: Bot, label: 'Agente Automático', permission: 'managePlatform', roles: ['owner', 'admin', 'supervisor'] },
      { to: '/persona', icon: Brain, label: 'Persona do agente', permission: 'managePlatform', roles: ['owner', 'admin', 'supervisor'] },
      { to: '/agente/aprendizado', icon: GraduationCap, label: 'Aprendizado', permission: 'managePlatform', roles: ['owner', 'admin', 'supervisor'] },
    ] },
    { title: 'GESTÃO', items: [
      { to: '/campanhas', icon: Megaphone, label: 'Campanhas', permission: 'managePlatform', roles: ['owner', 'admin', 'supervisor'] },
      { to: '/relatorios', icon: BarChart3, label: 'Relatórios', permission: 'viewReports', roles: ['owner', 'admin', 'supervisor'] },
      {
        to: '/configuracoes',
        icon: Settings,
        label: 'Configurações',
        children: settingsChildren,
      },
    ] },
  ];
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function isSettingsChildActive(pathname: string, search: string, childTo: string): boolean {
  if (pathname !== '/configuracoes') return false;
  const childTab = new URLSearchParams(childTo.split('?')[1] ?? '').get('tab') ?? 'perfil';
  const currentTab = new URLSearchParams(search).get('tab') ?? 'perfil';
  return childTab === currentTab;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { logout, user } = useAuth();
  const { can } = usePermissions();
  const workspace = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const systemAdmin = isSystemAdmin(user);
  const { count: handoffWaitingCount } = useUnclaimedConversationAlert();
  const [settingsOpen, setSettingsOpen] = useState(() => location.pathname.startsWith('/configuracoes'));

  useEffect(() => {
    if (location.pathname.startsWith('/configuracoes')) {
      setSettingsOpen(true);
    }
  }, [location.pathname]);

  const visibleSections = useMemo(() => {
    const settingsChildren: NavItem[] = filterSettingsNavItems(
      SETTINGS_NAV_ITEMS,
      can,
      workspace.role,
      systemAdmin,
    ).map((item) => ({
      to: settingsTabPath(item.id),
      icon: item.icon,
      label: item.label,
      group: SETTINGS_GROUP_LABELS[item.group as SettingsTabGroup],
      permission: item.permission,
      roles: item.roles,
    }));

    const sections = filterNavSections(buildNavSections(settingsChildren), can, workspace.role);
    if (systemAdmin) {
      return [
        {
          title: 'SUPERADMIN',
          items: [
            { to: '/system/empresas', icon: Shield, label: 'Empresas e acessos' },
          ],
        },
        ...sections,
      ];
    }
    return sections;
  }, [can, workspace.role, systemAdmin]);

  const handleExitToLanding = () => {
    onMobileClose();
    logout();
    navigate('/');
  };

  const renderItem = (item: NavItem) => {
    const { to, icon: Icon, label, children } = item;
    const hasChildren = Boolean(children?.length);
    const isSettingsParent = to === '/configuracoes' && hasChildren;
    const parentActive = location.pathname.startsWith('/configuracoes');

    if (isSettingsParent && children) {
      return (
        <li key={to}>
          <button
            type="button"
            onClick={() => {
              if (collapsed) {
                navigate('/configuracoes');
                onMobileClose();
                return;
              }
              setSettingsOpen((open) => !open);
            }}
            className={cn(
              'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold leading-5 transition-all',
              parentActive
                ? 'bg-gradient-to-r from-blue-600 to-red-500 text-white shadow-lg shadow-blue-600/20'
                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white',
              collapsed && 'justify-center px-2',
            )}
            title={collapsed ? label : undefined}
            aria-expanded={settingsOpen}
          >
            <Icon className="h-[19px] w-[19px] shrink-0 transition-transform group-hover:scale-105" />
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1 truncate text-left">{label}</span>
                <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', settingsOpen && 'rotate-180')} />
              </>
            )}
          </button>
          <AnimatePresence initial={false}>
            {!collapsed && settingsOpen && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="mt-1 space-y-2 overflow-hidden border-l border-gray-200 pl-3 ml-5 dark:border-slate-700"
              >
                {Array.from(
                  children.reduce((acc, child) => {
                    const key = child.group || 'Outros';
                    if (!acc.has(key)) acc.set(key, []);
                    acc.get(key)!.push(child);
                    return acc;
                  }, new Map<string, NavItem[]>()),
                ).map(([groupLabel, groupItems]) => (
                  <li key={groupLabel} className="space-y-0.5">
                    <p className="px-2.5 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-slate-500">
                      {groupLabel}
                    </p>
                    <ul className="space-y-0.5">
                      {groupItems.map((child) => {
                        const ChildIcon = child.icon;
                        const active = isSettingsChildActive(location.pathname, location.search, child.to);
                        return (
                          <li key={child.to}>
                            <NavLink
                              to={child.to}
                              onClick={onMobileClose}
                              className={cn(
                                'flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
                                active
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                                  : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white',
                              )}
                            >
                              <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{child.label}</span>
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </li>
      );
    }

    return (
      <li key={to} className={cn(to === '/atendimento' && handoffWaitingCount > 0 && collapsed && 'relative')}>
        <NavLink
          to={to}
          end={to === '/configuracoes'}
          onClick={onMobileClose}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold leading-5 transition-all',
              isActive
                ? 'bg-gradient-to-r from-blue-600 to-red-500 text-white shadow-lg shadow-blue-600/20'
                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white',
              collapsed && 'justify-center px-2',
            )
          }
          title={collapsed ? label : undefined}
        >
          <Icon className="h-[19px] w-[19px] shrink-0 transition-transform group-hover:scale-105" />
          {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
          {to === '/atendimento' && handoffWaitingCount > 0 && (
            <span
              className={cn(
                'flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white',
                collapsed && 'absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1 text-[10px]',
              )}
            >
              {handoffWaitingCount}
            </span>
          )}
        </NavLink>
      </li>
    );
  };

  const content = (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-gray-200/80 bg-white/95 shadow-lg shadow-slate-200/40 backdrop-blur-xl transition-all duration-300 dark:border-slate-700/70 dark:bg-chatbo-background-elevated/95 dark:shadow-black/20',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-200/80 px-4 dark:border-slate-700/70">
        <div title="ChatBô" className={cn(collapsed && 'mx-auto')}>
          <Logo size="sm" showText={!collapsed} />
        </div>
        <button
          onClick={onToggle}
          className="hidden rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-700 lg:block dark:hover:bg-white/10 dark:hover:text-white"
        >
          <ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
        </button>
        <button
          onClick={onMobileClose}
          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-700 lg:hidden dark:hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {visibleSections.map((section) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <p className="mb-2 px-6 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-slate-400">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5 px-3">
              {section.items.map(renderItem)}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-200/80 p-3 dark:border-white/10">
        <button
          type="button"
          onClick={handleExitToLanding}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30',
            collapsed && 'justify-center px-2',
          )}
          title={collapsed ? 'Sair da plataforma' : undefined}
        >
          <LogOut className="h-[19px] w-[19px] shrink-0" />
          {!collapsed && <span>Sair da plataforma</span>}
        </button>
      </div>

      {!collapsed && (
        <div className="border-t border-gray-200/80 p-4 dark:border-white/10">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1220] via-blue-700 to-red-600 p-4 text-white shadow-lg shadow-blue-900/20">
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
            <div className="relative">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Flame className="h-4 w-4" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">ChatBô</p>
              <p className="mt-1 text-sm font-semibold leading-5">Acelere leads prontos para comprar.</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-semibold">
                <DollarSign className="h-3 w-3" /> Receita em foco
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block">{content}</div>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
