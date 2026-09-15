import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Conversation } from '@/types';
import { filterInboxConversations } from '@/utils/conversationAlerts';

interface ChatContextValue {
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  filter: string;
  setFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showWaitingQueue: () => void;
  filterConversations: (conversations: Conversation[]) => Conversation[];
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterConversations = useCallback(
    (conversations: Conversation[]) => filterInboxConversations(conversations, {
      channel: filter, status: statusFilter, search: searchQuery,
    }),
    [searchQuery, statusFilter, filter],
  );

  const showWaitingQueue = useCallback(() => {
    setFilter('all');
    setStatusFilter('waiting');
    setSearchQuery('');
    setActiveConversationId(null);
  }, []);

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
      showWaitingQueue,
      filterConversations,
    }),
    [
      activeConversationId,
      filter,
      statusFilter,
      searchQuery,
      filterConversations,
      showWaitingQueue,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
