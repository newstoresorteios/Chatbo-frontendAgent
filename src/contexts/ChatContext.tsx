import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Conversation } from '@/types';

interface ChatContextValue {
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  filter: string;
  setFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterConversations: (conversations: Conversation[]) => Conversation[];
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterConversations = useCallback(
    (conversations: Conversation[]) => {
      return conversations.filter((c) => {
        const name = (c.customerName || '').toLowerCase();
        const last = (c.lastMessage || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery || name.includes(query) || last.includes(query);
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        const matchesChannel = filter === 'all' || c.channel === filter;
        return matchesSearch && matchesStatus && matchesChannel;
      });
    },
    [searchQuery, statusFilter, filter],
  );

  const value = useMemo(
    () => ({
      activeConversationId,
      setActiveConversationId,
      filter,
      setFilter,
      statusFilter,
      setStatusFilter,
      searchQuery,
      setSearchQuery,
      filterConversations,
    }),
    [
      activeConversationId,
      filter,
      statusFilter,
      searchQuery,
      filterConversations,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
