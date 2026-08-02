import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Notification } from '@/types';

interface Toast {
  id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationContextValue {
  notifications: Notification[];
  toasts: Toast[];
  unreadCount: number;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const initialNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Nova conversa',
    message: 'Carlos Mendes iniciou uma conversa',
    read: false,
    createdAt: new Date(Date.now() - 300000).toISOString(),
    type: 'info',
  },
  {
    id: 'n2',
    title: 'Pedido confirmado',
    message: 'Pedido TC-2024-004 foi confirmado',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    type: 'success',
  },
  {
    id: 'n3',
    title: 'Sincronização Mercos',
    message: 'Produtos sincronizados com sucesso',
    read: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    type: 'success',
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      toasts,
      unreadCount,
      addToast,
      removeToast,
      markAsRead,
      markAllAsRead,
    }),
    [notifications, toasts, unreadCount, addToast, removeToast, markAsRead, markAllAsRead],
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}
