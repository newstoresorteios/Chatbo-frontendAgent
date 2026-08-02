import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Conversation, Message } from '@/types';

interface ChatContextValue {
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  localMessages: Record<string, Message[]>;
  addLocalMessage: (conversationId: string, message: Message) => void;
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
  const [isTyping, setIsTyping] = useState(false);
  const [localMessages, setLocalMessages] = useState<Record<string, Message[]>>({});
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const addLocalMessage = useCallback((conversationId: string, message: Message) => {
    setLocalMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] ?? []), message],
    }));
  }, []);

  const filterConversations = useCallback(
    (conversations: Conversation[]) => {
      return conversations.filter((c) => {
        const matchesSearch =
          !searchQuery ||
          c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
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
      isTyping,
      setIsTyping,
      localMessages,
      addLocalMessage,
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
      isTyping,
      localMessages,
      addLocalMessage,
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
