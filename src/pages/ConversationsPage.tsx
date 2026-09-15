import { AgentContextPanel } from '@/components/chat/AgentContextPanel';
import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ConversationCard } from '@/components/chat/ConversationCard';
import { MessageInput } from '@/components/chat/MessageInput';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, Loading } from '@/components/ui/EmptyState';
import { ConversationsEmptyState, ConversationsSelectPrompt } from '@/components/ui/GuidedEmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Search } from '@/components/ui/Search';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useNotification } from '@/contexts/NotificationContext';
import {
  useConversationAgentContext,
  useConversations,
  useCustomerDetail,
  useMessages,
  useProducts,
} from '@/hooks/useQueries';
import { useConversationSuggestion } from '@/hooks/useConversationSuggestion';
import { useUnclaimedConversationAlert } from '@/hooks/useUnclaimedConversationAlert';
import { conversationsService, mergeConversationMessages } from '@/services/conversations.service';
import { roleLabel, usersService } from '@/services/users.service';
import { extractApiErrorMessage } from '@/utils/apiErrors';
import type { Conversation, Message } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Package,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Target,
  User,
  UserCheck,
  Wand2,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const STATUS_LABELS = {
  active: 'Ativa',
  waiting: 'Aguardando',
  closed: 'Encerrada',
} as const;

const STATUS_VARIANTS = {
  active: 'success' as const,
  waiting: 'warning' as const,
  closed: 'default' as const,
};

const MESSAGE_PAGE_SIZE = 60;

function messageDayLabel(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();

  if (sameDay(date, today)) return 'Hoje';
  if (sameDay(date, yesterday)) return 'Ontem';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  }).format(date);
}

export function ConversationsPage() {
  const {
    activeConversationId,
    setActiveConversationId,
    filterConversations,
    filter,
    setFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    showWaitingQueue,
  } = useChat();

  const { user } = useAuth();
  const { count: waitingCount, shouldFlash, isAttending } = useUnclaimedConversationAlert();
  const [transferOpen, setTransferOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(true);
  const [closeOpen, setCloseOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [transferAgent, setTransferAgent] = useState('');
  const [reserveProduct, setReserveProduct] = useState('');
  const [closeNote, setCloseNote] = useState('');
  const {
    data: conversations,
    isLoading,
    isError: conversationsError,
    error: conversationsLoadError,
    isFetching: conversationsFetching,
    dataUpdatedAt,
    refetch: refetchConversations,
  } = useConversations({ live: true });
  const {
    data: messages,
    isLoading: messagesLoading,
    isError: messagesError,
    error: messagesLoadError,
    refetch: refetchMessages,
  } = useMessages(
    activeConversationId,
    { live: true },
  );
  const knownConversationIdsRef = useRef<Set<string> | null>(null);
  const initialSelectionDone = useRef(false);
  const attemptedReadKeysRef = useRef(new Map<string, number>());
  const activeConversation = conversations?.find((c) => c.id === activeConversationId);
  const { data: customerDetail } = useCustomerDetail(activeConversation?.customerId, contextOpen);
  const {
    data: agentContext,
    isLoading: agentContextLoading,
    isError: agentContextError,
  } = useConversationAgentContext(activeConversationId, contextOpen);
  const { data: teamUsers, isLoading: teamLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: usersService.list,
    enabled: transferOpen,
  });
  const { data: productsData, isLoading: productsLoading } = useProducts(
    { page: 1, pageSize: 50 },
    reserveOpen,
  );
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesViewportRef = useRef<HTMLDivElement>(null);
  const lastScrolledConversationRef = useRef<string | null>(null);
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const agentOptions = useMemo(
    () =>
      (teamUsers ?? [])
        .filter((u) => u.active)
        .map((u) => ({
          value: u.id,
          label: `${u.name} — ${roleLabel(u.role)}`,
        })),
    [teamUsers],
  );

  const productOptions = useMemo(
    () =>
      (productsData?.data ?? []).map((p) => ({
        value: p.id,
        label: `${p.name}${p.code ? ` (${p.code})` : ''}`,
      })),
    [productsData],
  );

  useEffect(() => {
    if (agentOptions.length && !transferAgent) {
      setTransferAgent(agentOptions[0].value);
    }
  }, [agentOptions, transferAgent]);

  useEffect(() => {
    if (productOptions.length && !reserveProduct) {
      setReserveProduct(productOptions[0].value);
    }
  }, [productOptions, reserveProduct]);

  // Distinct persisted messages may have the same text and minute, especially across sessions.
  const mergedForAi = useMemo(
    () => activeConversationId ? mergeConversationMessages([], messages ?? []) : [],
    [messages, activeConversationId],
  );

  const { data: aiSuggestion, isLoading: aiLoading } = useConversationSuggestion(
    activeConversationId,
    activeConversation?.customerId,
    mergedForAi,
    contextOpen,
  );

  const filtered = useMemo(
    () => (conversations ? filterConversations(conversations) : []),
    [conversations, filterConversations],
  );
  const hasActiveFilters =
    filter !== 'all' || statusFilter !== 'all' || Boolean(searchQuery.trim());
  const isInboxEmpty = (conversations?.length ?? 0) === 0;
  const displayList = useMemo(() => {
    const mine = user?.id;
    return [...filtered].sort((a, b) => {
      const aMine = mine && a.assignedTo === mine ? 0 : 1;
      const bMine = mine && b.assignedTo === mine ? 0 : 1;
      if (aMine !== bMine) return aMine - bMine;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });
  }, [filtered, user?.id]);
  const isClosed = activeConversation?.status === 'closed';
  const isAssignedToMe = !!user?.id && activeConversation?.assignedTo === user.id;
  const canReply = Boolean(user?.id) && isAssignedToMe && !isClosed;

  useEffect(() => {
    if (!activeConversationId || !isAssignedToMe || !activeConversation?.unreadCount
      || messagesLoading || messagesError || !messages
      || document.visibilityState !== 'visible') return;
    const key = `${activeConversationId}:${activeConversation.lastMessageAt}`;
    const now = Date.now();
    if ((attemptedReadKeysRef.current.get(key) ?? 0) > now - 10_000) return;
    attemptedReadKeysRef.current.set(key, now);
    void conversationsService.markRead(activeConversationId).then((updated) => {
      queryClient.setQueryData<Conversation[]>(['conversations'], (old) =>
        old?.map((conversation) => conversation.id === updated.id
          ? (conversation.lastMessageAt === updated.lastMessageAt
            ? { ...conversation, unreadCount: updated.unreadCount }
            : conversation)
          : conversation),
      );
      if (updated.unreadCount === 0) attemptedReadKeysRef.current.set(key, Infinity);
    }).catch(() => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });
  }, [activeConversationId, activeConversation?.lastMessageAt, activeConversation?.unreadCount,
    isAssignedToMe, messages, messagesLoading, messagesError, queryClient]);

  const invalidateConversation = () => {
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    if (activeConversationId) {
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
    }
  };

  const patchConversationCache = async (updated: Conversation) => {
    // An inbox poll started before the mutation must not restore its old status.
    await queryClient.cancelQueries({ queryKey: ['conversations'] });
    queryClient.setQueryData<Conversation[]>(['conversations'], (old) =>
      old?.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)) ?? [updated],
    );
  };

  useEffect(() => {
    if (searchParams.get('fila') === 'aguardando') {
      initialSelectionDone.current = true;
      showWaitingQueue();
      navigate('/atendimento', { replace: true });
      return;
    }
    const fromQuery = searchParams.get('conversa');
    if (fromQuery) {
      initialSelectionDone.current = true;
      const contact = conversations?.find((conversation) => conversation.id === fromQuery || conversation.sessionIds?.includes(fromQuery));
      setActiveConversationId(contact?.id ?? fromQuery);
      return;
    }
    if (conversations && !initialSelectionDone.current) {
      initialSelectionDone.current = true;
      if (!activeConversationId && statusFilter !== 'waiting' && window.matchMedia('(min-width: 768px)').matches) {
        setActiveConversationId(filtered[0]?.id ?? null);
      }
    }
  }, [conversations, filtered, activeConversationId, statusFilter, setActiveConversationId, searchParams, showWaitingQueue, navigate]);

  // Avisa e mantém a fila atualizada quando o NSAgent cria novas conversas.
  useEffect(() => {
    if (!conversations) return;
    const nextIds = new Set(conversations.map((c) => c.id));
    const previous = knownConversationIdsRef.current;
    if (previous === null) {
      knownConversationIdsRef.current = nextIds;
      return;
    }
    const newcomers = conversations.filter((c) => !previous.has(c.id));
    knownConversationIdsRef.current = nextIds;
    if (newcomers.length === 1) {
      addToast({
        title: 'Nova conversa',
        message: newcomers[0].customerName || 'Um novo lead entrou na Central',
        type: 'info',
      });
    } else if (newcomers.length > 1) {
      addToast({
        title: 'Novas conversas',
        message: `${newcomers.length} leads entraram na fila`,
        type: 'info',
      });
    }
  }, [conversations, addToast]);

  useEffect(() => {
    const viewport = messagesViewportRef.current;
    if (!viewport) return;
    const conversationChanged = lastScrolledConversationRef.current !== activeConversationId;
    lastScrolledConversationRef.current = activeConversationId;
    const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    if (conversationChanged || distanceFromBottom < 180) {
      messagesEndRef.current?.scrollIntoView({ behavior: conversationChanged ? 'auto' : 'smooth' });
    }
  }, [messages, activeConversationId]);

  useEffect(() => {
    setHasOlderMessages(true);
    setLoadingOlderMessages(false);
  }, [activeConversationId]);

  useEffect(() => {
    if (!messagesLoading && messages && messages.length < MESSAGE_PAGE_SIZE) {
      setHasOlderMessages(false);
    }
  }, [messagesLoading, messages, activeConversationId]);

  const handleLoadOlderMessages = async () => {
    if (!activeConversationId || loadingOlderMessages || !hasOlderMessages) return;
    const earliest = allMessages.find((message) => !message.id.startsWith('pending-'));
    if (!earliest) {
      setHasOlderMessages(false);
      return;
    }

    const viewport = messagesViewportRef.current;
    const previousHeight = viewport?.scrollHeight ?? 0;
    const previousTop = viewport?.scrollTop ?? 0;
    setLoadingOlderMessages(true);
    try {
      const older = await conversationsService.getMessages(activeConversationId, {
        before: earliest.timestamp,
        beforeId: /^[0-9a-f-]{36}$/i.test(earliest.id) ? earliest.id : undefined,
        limit: MESSAGE_PAGE_SIZE,
      });
      queryClient.setQueryData<Message[]>(['messages', activeConversationId], (current = []) =>
        mergeConversationMessages(current, older),
      );
      if (lastScrolledConversationRef.current !== activeConversationId) return;
      if (older.length < MESSAGE_PAGE_SIZE) setHasOlderMessages(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!viewport || lastScrolledConversationRef.current !== activeConversationId) return;
          viewport.scrollTop = previousTop + viewport.scrollHeight - previousHeight;
        });
      });
    } catch (error) {
      addToast({
        title: 'Histórico indisponível',
        message: extractApiErrorMessage(error, 'Não foi possível carregar mensagens anteriores.'),
        type: 'error',
      });
    } finally {
      if (lastScrolledConversationRef.current === activeConversationId) setLoadingOlderMessages(false);
    }
  };

  const sendMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string; tempId: string }) =>
      conversationsService.sendMessage(conversationId, content),
    onMutate: async ({ conversationId, content, tempId }) => {
      const queryKey = ['messages', conversationId] as const;
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Message[]>(queryKey);
      const optimistic: Message = {
        id: tempId,
        conversationId,
        content,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        status: 'sending',
      };
      queryClient.setQueryData<Message[]>(queryKey, (old = []) => [...old, optimistic]);
      queryClient.setQueryData<Conversation[]>(['conversations'], (old = []) =>
        old.map((conversation) => conversation.id === conversationId
          ? {
              ...conversation,
              lastMessage: content,
              lastMessageAt: optimistic.timestamp,
              unreadCount: 0,
            }
          : conversation),
      );
      return { previous };
    },
    onSuccess: (message, { conversationId, tempId }) => {
      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) =>
        old.map((item) => (item.id === tempId ? message : item)),
      );
      queryClient.setQueryData<Conversation[]>(['conversations'], (old = []) =>
        old.map((conversation) => conversation.id === conversationId
          ? {
              ...conversation,
              lastMessage: message.content,
              lastMessageAt: message.timestamp,
              unreadCount: 0,
            }
          : conversation),
      );
    },
    onError: (error, { conversationId, tempId }) => {
      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) =>
        old.map((item) => (item.id === tempId ? { ...item, status: 'failed' } : item)),
      );
      addToast({
        title: 'Erro ao enviar',
        message: extractApiErrorMessage(
          error,
          'Assuma a conversa e verifique se o Brevo está configurado no backend.',
        ),
        type: 'error',
      });
    },
  });

  const mediaMutation = useMutation({
    mutationFn: ({ conversationId, file, caption }: {
      conversationId: string; file: File; caption: string; tempId: string;
    }) => conversationsService.sendMedia(conversationId, file, caption),
    onMutate: async ({ conversationId, file, caption, tempId }) => {
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });
      const mediaType = file.type.startsWith('image/') ? 'image'
        : file.type.startsWith('audio/') ? 'audio' : 'document';
      const optimistic: Message = {
        id: tempId, conversationId, sender: 'agent', status: 'sending',
        timestamp: new Date().toISOString(), content: caption || `[${mediaType}: ${file.name}]`,
        mediaType, mediaFilename: file.name, mediaContentType: file.type,
        mediaByteSize: file.size, mediaUrl: URL.createObjectURL(file),
      };
      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) => [...old, optimistic]);
      return optimistic.mediaUrl;
    },
    onSuccess: (message, { conversationId, tempId }, localUrl) => {
      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) =>
        mergeConversationMessages(old.filter((item) => item.id !== tempId), [message]),
      );
      queryClient.setQueryData<Conversation[]>(['conversations'], (old = []) =>
        old.map((conversation) => conversation.id === conversationId
          ? { ...conversation, lastMessage: message.content, lastMessageAt: message.timestamp, unreadCount: 0 }
          : conversation),
      );
      if (localUrl) URL.revokeObjectURL(localUrl);
    },
    onError: (error, { conversationId, tempId }) => {
      queryClient.setQueryData<Message[]>((['messages', conversationId]), (old = []) =>
        old.map((item) => item.id === tempId ? { ...item, status: 'failed' } : item),
      );
      addToast({ title: 'Anexo não enviado', message: extractApiErrorMessage(error), type: 'error' });
    },
  });

  const transferMutation = useMutation({
    mutationFn: () =>
      conversationsService.transfer(activeConversationId!, transferAgent),
    onSuccess: async (conv) => {
      await patchConversationCache(conv);
      addToast({
        title: 'Atendimento transferido',
        message: `Conversa atribuída a ${conv.assignedName ?? 'novo atendente'}`,
        type: 'success',
      });
      setTransferOpen(false);
      invalidateConversation();
    },
    onError: () => {
      addToast({ title: 'Erro', message: 'Não foi possível transferir', type: 'error' });
    },
  });

  const assumeMutation = useMutation({
    mutationFn: (conversationId: string) => conversationsService.assume(conversationId),
    onSuccess: async (updated) => {
      await patchConversationCache(updated);
      addToast({
        title: 'Atendimento assumido',
        message: 'Agora você pode responder o cliente por esta tela.',
        type: 'success',
      });
      invalidateConversation();
    },
    onError: () => {
      addToast({ title: 'Erro', message: 'Não foi possível assumir', type: 'error' });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () =>
      conversationsService.close(activeConversationId!, closeNote || undefined),
    onSuccess: async (updated) => {
      await patchConversationCache(updated);
      addToast({ title: 'Atendimento encerrado', message: 'Conversa marcada como encerrada', type: 'success' });
      setCloseOpen(false);
      setCloseNote('');
      invalidateConversation();
    },
    onError: () => {
      addToast({ title: 'Erro', message: 'Não foi possível encerrar', type: 'error' });
    },
  });

  const reopenMutation = useMutation({
    mutationFn: () => conversationsService.reopen(activeConversationId!),
    onSuccess: async (updated) => {
      await patchConversationCache(updated);
      setStatusFilter('all');
      addToast({ title: 'Atendimento reaberto', message: 'Conversa ativa novamente', type: 'success' });
      invalidateConversation();
    },
    onError: () => {
      addToast({ title: 'Erro', message: 'Não foi possível reabrir', type: 'error' });
    },
  });

  const reserveMutation = useMutation({
    mutationFn: () => {
      const product = productOptions.find((p) => p.value === reserveProduct);
      return conversationsService.reserveProduct(activeConversationId!, {
        productId: reserveProduct,
        productName: product?.label,
      });
    },
    onSuccess: () => {
      const product = productOptions.find((p) => p.value === reserveProduct);
      addToast({
        title: 'Produto reservado',
        message: `${product?.label ?? 'Produto'} reservado por 48h`,
        type: 'success',
      });
      setReserveOpen(false);
      invalidateConversation();
    },
    onError: () => {
      addToast({ title: 'Erro', message: 'Não foi possível registrar a reserva', type: 'error' });
    },
  });

  const handleSend = (content: string) => {
    if (!activeConversationId || !canReply) {
      addToast({
        title: 'Assuma a conversa',
        message: 'Clique em Assumir antes de enviar mensagens ao cliente.',
        type: 'warning',
      });
      return;
    }
    sendMutation.mutate({
      conversationId: activeConversationId,
      content,
      tempId: `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    });
  };

  const handleSendFile = (file: File, caption: string) => {
    if (!activeConversationId || !canReply) return false;
    if (file.type.startsWith('audio/') && caption.trim()) {
      addToast({ title: 'Áudio sem legenda', message: 'Envie o texto separadamente do áudio.', type: 'warning' });
      return false;
    }
    if (activeConversation?.channel !== 'whatsapp' || !activeConversation.canalId) {
      addToast({ title: 'Canal não suportado', message: 'Anexos exigem WhatsApp Meta conectado.', type: 'warning' });
      return false;
    }
    mediaMutation.mutate({
      conversationId: activeConversationId, file, caption,
      tempId: `pending-media-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    });
    return true;
  };

  const handleRetryMessage = (message: Message) => {
    if (!activeConversationId || !canReply) return;
    if (message.mediaType) return;
    queryClient.setQueryData<Message[]>(['messages', activeConversationId], (old = []) =>
      old.filter((item) => item.id !== message.id),
    );
    handleSend(message.content);
  };

  const handleUseSuggestion = () => {
    const text = aiSuggestion?.suggestion;
    if (!text) {
      addToast({ title: 'Aguarde', message: 'A IA ainda está analisando a conversa', type: 'warning' });
      return;
    }
    if (!canReply) {
      addToast({
        title: 'Assuma a conversa',
        message: 'Clique em Assumir para usar a sugestão e enviar ao cliente.',
        type: 'warning',
      });
      return;
    }
    handleSend(text);
  };

  const handleOpenFunnel = () => {
    addToast({ title: 'Funil aberto', message: 'Oportunidade vinculada ao cliente', type: 'info' });
    navigate('/funil');
  };

  const allMessages = mergedForAi;

  if (conversationsError) {
    return (
      <EmptyState
        icon={XCircle}
        title="Não foi possível carregar as conversas"
        description={extractApiErrorMessage(
          conversationsLoadError,
          'Verifique a conexão com o backend e tente novamente.',
        )}
        action={
          <Button variant="outline" onClick={() => { void refetchConversations(); }}>
            Tentar novamente
          </Button>
        }
      />
    );
  }

  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] flex-col overflow-hidden lg:-m-6">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-200/80 bg-white/95 px-3 py-2 dark:border-white/10 dark:bg-gray-950/90">
        <div className="flex min-w-0 items-center gap-2">
          <Target className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <h1 className="truncate font-display text-base font-bold text-gray-950 dark:text-white">
            Central de Conversão
          </h1>
          <Badge variant="info" className="shrink-0">
            {filtered.length}
          </Badge>
          <span className="hidden items-center gap-1.5 text-[11px] font-medium text-emerald-600 sm:inline-flex dark:text-emerald-400">
            <span className={`h-1.5 w-1.5 rounded-full bg-emerald-500 ${conversationsFetching ? 'animate-pulse' : ''}`} />
            Ao vivo
            {dataUpdatedAt ? ` · ${new Date(dataUpdatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => { void refetchConversations(); }}
            title="Atualizar agora"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${conversationsFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:w-auto sm:min-w-[28rem] sm:flex-1 sm:grid-cols-[minmax(0,1fr)_9rem_12rem]">
          <Search
            className="col-span-2 sm:col-span-1"
            placeholder="Buscar leads e conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            aria-label="Filtrar por canal"
            options={[
              { value: 'all', label: 'Todos os canais' },
              { value: 'whatsapp', label: 'WhatsApp' },
              { value: 'instagram', label: 'Instagram' },
              { value: 'facebook', label: 'Facebook' },
              { value: 'telegram', label: 'Telegram' },
              { value: 'webchat', label: 'WebChat' },
              { value: 'email', label: 'E-mail' },
            ]}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Select
            aria-label="Filtrar por status"
            options={[
              { value: 'all', label: 'Todos os status' },
              { value: 'active', label: 'Ativas' },
              { value: 'waiting', label: 'Aguardando atendimento' },
              { value: 'closed', label: 'Encerradas' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 border-t border-gray-100 pt-2 dark:border-gray-800">
          <Button
            type="button"
            size="sm"
            variant={statusFilter === 'waiting' ? 'danger' : 'outline'}
            aria-pressed={statusFilter === 'waiting'}
            onClick={() => {
              initialSelectionDone.current = true;
              showWaitingQueue();
              if (searchParams.get('conversa')) navigate('/atendimento', { replace: true });
            }}
          >
            <Clock3 className="h-4 w-4" />
            Aguardando atendimento
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800 dark:bg-red-950 dark:text-red-100">{waitingCount}</span>
          </Button>
          {hasActiveFilters && <Button type="button" size="sm" variant="ghost" onClick={() => {
            setStatusFilter('all'); setFilter('all'); setSearchQuery('');
          }}>Mostrar todos</Button>}
          <span role="status" className="text-xs text-gray-500 dark:text-gray-400">
            {isAttending && waitingCount > 0
              ? 'Alerta pausado enquanto você atende. A fila continua sendo atualizada.'
              : statusFilter === 'waiting' ? `${filtered.length} atendimento(s) na fila com os filtros atuais` : ''}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden bg-white dark:bg-gray-950">
        <aside
          aria-label="Lista de atendimentos"
          className={`flex w-full shrink-0 flex-col border-r border-gray-200 md:w-72 lg:w-80 dark:border-gray-800 ${
            activeConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6">
                <Loading text="Carregando conversas..." />
              </div>
            ) : displayList.length === 0 && statusFilter === 'waiting' && waitingCount === 0 ? (
              <EmptyState icon={CheckCircle2} title="Nenhum atendimento aguardando" description="Novas solicitações de atendimento humano aparecerão aqui." />
            ) : displayList.length === 0 ? (
              <ConversationsEmptyState filtered={!isInboxEmpty || hasActiveFilters} />
            ) : (
              displayList.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conversation={conv}
                  active={conv.id === activeConversationId}
                  animateWaiting={shouldFlash}
                  onClick={() => setActiveConversationId(conv.id)}
                />
              ))
            )}
          </div>
        </aside>

        <section className={`min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${activeConversationId ? 'flex' : 'hidden md:flex'}`}>
          {activeConversation ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-blue-200/60 bg-gradient-to-r from-blue-50/95 via-white to-white px-3 py-2 dark:border-blue-900/40 dark:from-blue-950/40 dark:via-gray-950 dark:to-gray-950">
                <div className="flex min-w-0 items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 md:hidden"
                    onClick={() => {
                      setActiveConversationId(null);
                      if (searchParams.get('conversa')) {
                        navigate('/atendimento', { replace: true });
                      }
                    }}
                    title="Voltar para lista"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                        {activeConversation.customerName}
                      </h3>
                      <Badge variant={STATUS_VARIANTS[activeConversation.status] ?? STATUS_VARIANTS.active}>
                        {STATUS_LABELS[activeConversation.status] ?? activeConversation.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {messagesLoading && allMessages.length === 0
                          ? '...'
                          : `${allMessages.length} msgs`}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        ao vivo
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      <ChannelBadge channel={activeConversation.channel} />
                      <span className="truncate text-xs text-gray-400">Histórico do contato{(activeConversation.sessionIds?.length ?? 0) > 1 ? ` · ${activeConversation.sessionIds!.length} atendimentos reunidos` : ''}</span>
                      {activeConversation.assignedName && (
                        <span className="truncate text-xs text-gray-500">
                          · {activeConversation.assignedName}
                          {activeConversation.department ? ` (${activeConversation.department})` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                  {!isClosed && !isAssignedToMe && user && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => activeConversationId && assumeMutation.mutate(activeConversationId)}
                      disabled={assumeMutation.isPending}
                    >
                      <UserCheck className="h-4 w-4" /> Assumir
                    </Button>
                  )}
                  {isClosed ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => reopenMutation.mutate()}
                      disabled={reopenMutation.isPending}
                    >
                      <RefreshCw className="h-4 w-4" /> Reabrir
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCloseOpen(true)}
                      disabled={!canReply}
                    >
                      <CheckCircle2 className="h-4 w-4" /> Concluir
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTransferOpen(true)}
                    disabled={isClosed || !canReply}
                  >
                    <RefreshCw className="h-4 w-4" /> Transferir
                  </Button>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-[#0b1220]">
                <div ref={messagesViewportRef} className="dashboard-grid-bg min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-4">
                  {isClosed && (
                    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                      Conversa encerrada. Reabra para enviar novas mensagens.
                    </div>
                  )}
                  {allMessages.length > 0 && (
                    <div className="flex justify-center pb-1">
                      {hasOlderMessages ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { void handleLoadOlderMessages(); }}
                          disabled={loadingOlderMessages}
                        >
                          {loadingOlderMessages
                            ? <RefreshCw className="h-4 w-4 animate-spin" />
                            : <ChevronUp className="h-4 w-4" />}
                          {loadingOlderMessages ? 'Carregando histórico...' : 'Carregar mensagens anteriores'}
                        </Button>
                      ) : (
                        <span className="rounded-full bg-white/90 px-3 py-1 text-xs text-gray-500 shadow-sm dark:bg-gray-900/90 dark:text-gray-400">
                          Início da conversa
                        </span>
                      )}
                    </div>
                  )}
                  {messagesLoading && allMessages.length === 0 ? (
                    <Loading text="Carregando mensagens..." />
                  ) : messagesError && allMessages.length === 0 ? (
                    <EmptyState
                      icon={XCircle}
                      title="Não foi possível carregar as mensagens"
                      description={extractApiErrorMessage(
                        messagesLoadError,
                        'Tente abrir a conversa novamente.',
                      )}
                      action={
                        <Button variant="outline" onClick={() => { void refetchMessages(); }}>
                          Tentar novamente
                        </Button>
                      }
                    />
                  ) : allMessages.length === 0 ? (
                    <EmptyState
                      icon={User}
                      title="Nenhuma mensagem ainda"
                      description="Assim que o lead ou o agente enviarem mensagens, elas aparecem aqui."
                    />
                  ) : (
                    allMessages.map((msg, index) => {
                      const day = messageDayLabel(msg.timestamp);
                      const previousDay = index > 0
                        ? messageDayLabel(allMessages[index - 1].timestamp)
                        : null;
                      return (
                        <div key={msg.id} className="space-y-3">
                          {day !== previousDay && (
                            <div className="flex items-center justify-center py-1">
                              <span className="rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-medium text-gray-500 shadow-sm dark:bg-gray-900/90 dark:text-gray-400">
                                {day}
                              </span>
                            </div>
                          )}
                          <ChatBubble
                            message={msg}
                            customerName={activeConversation.customerName}
                            onRetry={handleRetryMessage}
                          />
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {!canReply && !isClosed && (
                  <div className="shrink-0 border-t border-amber-200/60 bg-amber-50 px-3 py-2.5 dark:border-amber-900/40 dark:bg-amber-950/30">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        Assuma a conversa para pausar o agente e falar com o cliente.
                      </p>
                      {user && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => activeConversationId && assumeMutation.mutate(activeConversationId)}
                          disabled={assumeMutation.isPending}
                        >
                          <UserCheck className="h-4 w-4" /> Assumir agora
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="shrink-0 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                  <MessageInput
                    onSend={handleSend}
                    onSendFile={handleSendFile}
                    disabled={!canReply}
                    placeholder={
                      isClosed
                        ? 'Conversa encerrada'
                        : canReply
                          ? 'Digite sua resposta comercial...'
                          : 'Assuma a conversa para responder o cliente...'
                    }
                  />
                </div>
              </div>

              <div className="shrink-0 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setContextOpen((open) => !open)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                    Contexto e assistente
                  </span>
                  {contextOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {contextOpen && (
                  <div className="max-h-[38vh] space-y-3 overflow-y-auto border-t border-gray-100 px-3 py-3 dark:border-gray-800">
                    <div className="flex flex-wrap gap-1.5">
                      <Button variant="outline" size="sm" onClick={handleOpenFunnel}>
                        <ShoppingCart className="h-4 w-4" /> Abrir oportunidade
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReserveOpen(true)}
                        disabled={!canReply}
                      >
                        <Package className="h-4 w-4" /> Reservar produto
                      </Button>
                    </div>

                    <div className="rounded-xl border border-blue-200/70 bg-gradient-to-br from-blue-50 via-white to-red-50 p-3 dark:border-white/10 dark:from-blue-950/30 dark:via-gray-900 dark:to-red-950/20">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-blue-700 dark:text-blue-300">
                          <Sparkles className="h-3.5 w-3.5" /> Assistente ChatBô
                        </p>
                        {aiSuggestion && (
                          <Badge
                            variant={
                              aiSuggestion.priority === 'high'
                                ? 'danger'
                                : aiSuggestion.priority === 'medium'
                                  ? 'warning'
                                  : 'default'
                            }
                            className="text-[10px]"
                          >
                            {aiSuggestion.source === 'openai' ? 'GPT' : 'IA local'}
                          </Badge>
                        )}
                      </div>
                      {aiLoading ? (
                        <p className="mt-2 text-sm text-blue-500">Analisando oportunidade...</p>
                      ) : (
                        <>
                          <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">
                            {aiSuggestion?.insight ?? 'Selecione uma conversa para análise.'}
                          </p>
                          {aiSuggestion?.suggestion && (
                            <p className="mt-2 rounded-lg bg-white/70 p-2 text-sm text-gray-700 dark:bg-gray-950/50 dark:text-gray-300">
                              {aiSuggestion.suggestion}
                            </p>
                          )}
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={handleUseSuggestion}
                        disabled={aiLoading || !aiSuggestion?.suggestion || !canReply}
                      >
                        <Wand2 className="h-3.5 w-3.5" /> Usar resposta sugerida
                      </Button>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
                      <div className="rounded-xl border border-gray-200/80 bg-white/80 p-3 dark:border-white/10 dark:bg-gray-900/50">
                        {customerDetail ? (
                          <>
                            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
                              Contato
                            </p>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{customerDetail.name}</h3>
                            <div className="mt-2 space-y-1 text-sm">
                              <InfoRow label="Telefone" value={customerDetail.phone || activeConversation.contactPhone || '—'} />
                              <InfoRow label="Email" value={customerDetail.email || '—'} />
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
                              Contato
                            </p>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {activeConversation.customerName}
                            </h3>
                            {activeConversation.contactPhone && (
                              <p className="mt-1 text-sm text-gray-500">{activeConversation.contactPhone}</p>
                            )}
                          </>
                        )}
                      </div>
                      <AgentContextPanel
                        context={agentContext}
                        isLoading={agentContextLoading}
                        isError={agentContextError}
                        layout="grid"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <ConversationsSelectPrompt />
          )}
        </section>
      </div>

      <Modal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        title="Transferir conversa"
        footer={
          <>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancelar</Button>
            <Button onClick={() => transferMutation.mutate()} disabled={transferMutation.isPending || !transferAgent}>
              Transferir conversa
            </Button>
          </>
        }
      >
        {teamLoading ? (
          <Loading text="Carregando equipe..." />
        ) : agentOptions.length === 0 ? (
          <p className="text-sm text-gray-500">Cadastre pessoas com login em Configurações → Equipe e acessos.</p>
        ) : (
          <Select
            label="Atendente"
            options={agentOptions}
            value={transferAgent}
            onChange={(e) => setTransferAgent(e.target.value)}
          />
        )}
      </Modal>

      <Modal
        open={closeOpen}
        onClose={() => setCloseOpen(false)}
        title="Concluir atendimento"
        footer={
          <>
            <Button variant="outline" onClick={() => setCloseOpen(false)}>Cancelar</Button>
            <Button onClick={() => closeMutation.mutate()} disabled={closeMutation.isPending}>
              Concluir
            </Button>
          </>
        }
      >
        <Input
          label="Motivo (opcional)"
          value={closeNote}
          onChange={(e) => setCloseNote(e.target.value)}
          placeholder="Ex.: Cliente satisfeito, pedido concluído"
        />
      </Modal>

      <Modal
        open={reserveOpen}
        onClose={() => setReserveOpen(false)}
        title="Reservar produto"
        footer={
          <>
            <Button variant="outline" onClick={() => setReserveOpen(false)}>Cancelar</Button>
            <Button onClick={() => reserveMutation.mutate()} disabled={reserveMutation.isPending || !reserveProduct}>
              Confirmar reserva
            </Button>
          </>
        }
      >
        {productsLoading ? (
          <Loading text="Carregando produtos..." />
        ) : productOptions.length === 0 ? (
          <p className="text-sm text-gray-500">Sincronize produtos no Mercos primeiro.</p>
        ) : (
          <>
            <Select
              label="Produto"
              options={productOptions}
              value={reserveProduct}
              onChange={(e) => setReserveProduct(e.target.value)}
            />
            <p className="mt-3 text-xs text-gray-500">A reserva expira automaticamente em 48 horas.</p>
          </>
        )}
      </Modal>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-800">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
}
