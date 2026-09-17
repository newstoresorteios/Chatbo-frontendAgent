import { useAuth } from '@/contexts/AuthContext';
import { conversationsService } from '@/services/conversations.service';
import type { Notification } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

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

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: ({ signal }) => conversationsService.getConversations({ signal }),
    enabled: isAuthenticated,
    staleTime: 10_000,
    refetchInterval: isAuthenticated ? 15_000 : false,
    refetchIntervalInBackground: false,
    retry: 1,
  });

  const notifications = useMemo<Notification[]>(
    () => (conversations ?? [])
      .filter((conversation) => conversation.status === 'waiting' || conversation.unreadCount > 0)
      .slice(0, 20)
      .map((conversation) => {
        const id = `conversation:${conversation.id}:${conversation.status}:${conversation.handoffRequestedAt ?? conversation.lastMessageAt}`;
        const waiting = conversation.status === 'waiting';
        return {
          id,
          title: waiting ? 'Aguardando atendimento humano' : 'Nova mensagem',
          message: `${conversation.customerName}: ${conversation.lastMessage || 'Abra a conversa para visualizar.'}`,
          read: readIds.has(id),
          createdAt: conversation.handoffRequestedAt || conversation.lastMessageAt,
          type: waiting ? 'warning' : 'info',
          href: `/atendimento?conversa=${encodeURIComponent(conversation.id)}`,
        };
      }),
    [conversations, readIds],
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}`;
    setToasts((previous) => [...previous, { ...toast, id }]);
    setTimeout(() => setToasts((previous) => previous.filter((item) => item.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setReadIds((previous) => new Set(previous).add(id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((previous) => {
      const next = new Set(previous);
      notifications.forEach((notification) => next.add(notification.id));
      return next;
    });
  }, [notifications]);

  const value = useMemo(
    () => ({ notifications, toasts, unreadCount, addToast, removeToast, markAsRead, markAllAsRead }),
    [notifications, toasts, unreadCount, addToast, removeToast, markAsRead, markAllAsRead],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
}
