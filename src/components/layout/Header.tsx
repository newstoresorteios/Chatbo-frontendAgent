import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Search } from '@/components/ui/Search';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn, formatRelativeTime } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Building2, LogOut, Menu, Moon, Sun, UserCircle, Zap } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleExitToLanding = () => {
    setShowUserMenu(false);
    logout();
    navigate('/');
  };

  return (
    <header className="relative z-[80] flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/95 px-4 shadow-sm shadow-slate-200/40 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/95 dark:shadow-black/10 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <Search placeholder="Buscar leads, pedidos, clientes..." className="hidden w-72 md:block lg:w-80" />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-white/10">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="h-[19px] w-[19px]" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-blue-600 text-[10px] font-bold text-white shadow-sm shadow-red-500/40">
                {unreadCount}
              </span>
            )}
          </Button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-[110]" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="fixed left-3 right-3 top-16 z-[120] overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 shadow-2xl shadow-slate-900/15 backdrop-blur-xl dark:border-slate-600/80 dark:bg-slate-950/95 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
                >
                  <div className="flex items-center justify-between border-b border-gray-200/80 px-4 py-3 dark:border-white/10">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <Zap className="h-4 w-4 text-blue-600" /> Alertas comerciais
                    </h3>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary-600 hover:underline dark:text-primary-400"
                    >
                      Marcar todas como lidas
                    </button>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={cn(
                          'flex w-full flex-col gap-0.5 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-blue-50/70 dark:border-white/10 dark:hover:bg-white/10',
                          !n.read && 'bg-blue-50/60 dark:bg-blue-950/20',
                        )}
                      >
                        <span className="text-sm font-medium">{n.title}</span>
                        <span className="text-xs text-gray-500 dark:text-slate-300">{n.message}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-400">{formatRelativeTime(n.createdAt)}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="relative flex items-center gap-2 border-l border-gray-200/80 pl-2 sm:gap-3 sm:pl-3 dark:border-white/10">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
            <p className="flex items-center justify-end gap-1 text-xs text-gray-500">
              <Building2 className="h-3 w-3" />
              {user?.company}
            </p>
          </div>
          <button type="button" onClick={() => setShowUserMenu(!showUserMenu)}>
            <Avatar name={user?.name ?? 'U'} size="md" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-[110]" onClick={() => setShowUserMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="fixed left-3 right-3 top-16 z-[120] overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 py-1 shadow-2xl shadow-slate-900/15 backdrop-blur-xl dark:border-slate-600/80 dark:bg-slate-950/95 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-56"
                >
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                    <p className="truncate text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/perfil');
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <UserCircle className="h-4 w-4" />
                    Meu perfil
                  </button>
                  <button
                    type="button"
                    onClick={handleExitToLanding}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair da plataforma
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
