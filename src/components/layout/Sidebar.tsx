import { Logo } from '@/components/layout/Logo';
import { cn } from '@/utils';
import { filterNavSections, type NavSection } from '@/utils/navPermissions';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Bot,
  Brain,
  Building2,
  ChevronLeft,
  DollarSign,
  Flame,
  Gauge,
  GitBranch,
  Headphones,
  Link2,
  LogOut,
  Megaphone,
  Package,
  ShoppingCart,
  Sparkles,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { usePermissions } from '@/hooks/usePermissions';

const navSections: NavSection[] = [
  { title: 'OPERAÇÃO', items: [
    { to: '/dashboard', icon: Gauge, label: 'Painel Comercial' },
    { to: '/atendimento', icon: Headphones, label: 'Central de Conversão' },
    { to: '/contatos', icon: Users, label: 'Clientes' },
    { to: '/produtos', icon: Package, label: 'Produtos' },
    { to: '/pedidos', icon: ShoppingCart, label: 'Pedidos' },
    { to: '/funil', icon: GitBranch, label: 'Funil de Vendas' },
  ] },
  { title: 'AGENTE', items: [
    { to: '/copiloto', icon: Sparkles, label: 'Assistente ChatBô' },
    { to: '/robo', icon: Bot, label: 'Agente Automático' },
    { to: '/persona', icon: Brain, label: 'Persona do agente', permission: 'managePlatform' },
  ] },
  { title: 'GESTÃO', items: [
    { to: '/campanhas', icon: Megaphone, label: 'Campanhas', permission: 'managePlatform' },
    { to: '/relatorios', icon: BarChart3, label: 'Relatórios', permission: 'viewReports' },
    { to: '/configuracoes', icon: UserCircle, label: 'Equipe e acessos' },
    { to: '/integracoes', icon: Link2, label: 'Canais e integrações', permission: 'manageIntegrations' },
    { to: '/minha-empresa', icon: Building2, label: 'Minha empresa', permission: 'manageUsers', roles: ['owner', 'admin'] },
  ] },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { logout } = useAuth();
  const { can } = usePermissions();
  const workspace = useWorkspace();
  const navigate = useNavigate();
  const visibleSections = filterNavSections(navSections, can, workspace.role);

  const handleExitToLanding = () => {
    onMobileClose();
    logout();
    navigate('/');
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
              {section.items.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
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
                  </NavLink>
                </li>
              ))}
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
