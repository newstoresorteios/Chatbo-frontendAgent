import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, CreditCard, Gauge, Layers3, LayoutDashboard, LogOut } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/system/empresas', label: 'Empresas', icon: Building2 },
  { to: '/system/workspaces', label: 'Workspaces', icon: LayoutDashboard },
  { to: '/system/planos', label: 'Planos', icon: Layers3 },
  { to: '/system/assinaturas', label: 'Assinaturas', icon: CreditCard },
  { to: '/system/uso', label: 'Uso', icon: Gauge },
];

export function SystemAdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-white/10 bg-slate-900/80 text-slate-100 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-4">
            <Logo size="sm" showText />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-300">
                Superadmin
              </p>
              <p className="text-sm text-slate-300">Provisionamento de empresas e acessos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="text-right">
              <p className="font-semibold text-white">{user?.name ?? 'Admin'}</p>
              <p className="text-xs text-slate-300">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-slate-300 hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/40'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
