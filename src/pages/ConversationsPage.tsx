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
import { conversationsService } from '@/services/conversations.service';
import { roleLabel, usersService } from '@/services/users.service';
import { extractApiErrorMessage } from '@/utils/apiErrors';
import { formatCurrency, formatDateTime } from '@/utils';
import type { Conversation } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
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

export function ConversationsPage() {
  const {
    activeConversationId,
    setActiveConversationId,
    isTyping,
    setIsTyping,
    localMessages,
    addLocalMessage,
    filterConversations,
    filter,
    setFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
  } = useChat();

  const { user } = useAuth();
  const {
    data: conversations,
    isLoading,
    isError: conversationsError,
    refetch: refetchConversations,
  } = useConversations();
  const { data: messages, isLoading: messagesLoading } = useMessages(activeConversationId);
  const activeConversation = conversations?.find((c) => c.id === activeConversationId);
  const { data: customerDetail } = useCustomerDetail(activeConversation?.customerId);
  const {
    data: agentContext,
    isLoading: agentContextLoading,
    isError: agentContextError,
  } = useConversationAgentContext(activeConversationId);
  const { data: teamUsers, isLoading: teamLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: usersService.list,
  });
  const { data: productsData } = useProducts({ page: 1, pageSize: 50 });
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [transferOpen, setTransferOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [transferAgent, setTransferAgent] = useState('');
  const [reserveProduct, setReserveProduct] = useState('');
  const [closeNote, setCloseNote] = useState('');

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

  const mergedForAi = useMemo(() => {
    if (!activeConversationId) return [];
    return [
      ...(messages ?? []),
      ...(localMessages[activeConversationId] ?? []),
    ].filter(
      (msg, index, self) => self.findIndex((m) => m.id === msg.id) === index,
    );
  }, [messages, localMessages, activeConversationId]);

  const { data: aiSuggestion, isLoading: aiLoading } = useConversationSuggestion(
    activeConversationId,
    activeConversation?.customerId,
    mergedForAi,
  );

  const filtered = conversations ? filterConversations(conversations) : [];
  const hasActiveFilters =
    filter !== 'all' || statusFilter !== 'all' || Boolean(searchQuery.trim());
  const isInboxEmpty = (conversations?.length ?? 0) === 0;
  const displayList = useMemo(() => {
    if (!activeConversationId || !conversations?.length) return filtered;
    if (filtered.some((c) => c.id === activeConversationId)) return filtered;
    const selected = conversations.find((c) => c.id === activeConversationId);
    return selected ? [selected, ...filtered] : filtered;
  }, [filtered, conversations, activeConversationId]);
  const isClosed = activeConversation?.status === 'closed';
  const isAssignedToMe = !!user?.id && activeConversation?.assignedTo === user.id;
  const canReply = Boolean(user?.id) && isAssignedToMe && !isClosed;

  const invalidateConversation = () => {
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    if (activeConversationId) {
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
    }
  };

  const patchConversationCache = (updated: Conversation) => {
    queryClient.setQueryData<Conversation[]>(['conversations'], (old) =>
      old?.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)) ?? [updated],
    );
  };

  useEffect(() => {
    const fromQuery = searchParams.get('conversa');
    if (fromQuery) {
      setActiveConversationId(fromQuery);
      return;
    }
    if (conversations?.length && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId, setActiveConversationId, searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, localMessages, activeConversationId]);

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      conversationsService.sendMessage(activeConversationId!, content),
    onSuccess: (message) => {
      addLocalMessage(activeConversationId!, message);
      invalidateConversation();
      addToast({
        title: 'Mensagem enviada',
        message: 'A resposta foi entregue ao cliente pelo canal da conversa.',
        type: 'success',
      });
    },
    onError: (error) => {
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

  const transferMutation = useMutation({
    mutationFn: () =>
      conversationsService.transfer(activeConversationId!, transferAgent),
    onSuccess: (conv) => {
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
    mutationFn: () => conversationsService.assume(activeConversationId!),
    onSuccess: (updated) => {
      patchConversationCache(updated);
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
    onSuccess: (updated) => {
      patchConversationCache(updated);
      setStatusFilter('all');
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
    onSuccess: (updated) => {
      patchConversationCache(updated);
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
    sendMutation.mutate(content);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
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

  if (isLoading) return <Loading text="Carregando conversas..." />;
  if (conversationsError) {
    return (
      <EmptyState
        icon={XCircle}
        title="Não foi possível carregar as conversas"
        description="Verifique a conexão com o backend e tente novamente."
        action={
          <Button variant="outline" onClick={() => { void refetchConversations(); }}>
            Tentar novamente
          </Button>
        }
      />
    );
  }

  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] flex-col lg:-m-6">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200/80 bg-white/90 px-4 py-3 dark:border-white/10 dark:bg-gray-950/80">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <h1 className="truncate font-display text-lg font-bold tracking-tight text-gray-950 dark:text-white">
              Central de Conversão
            </h1>
          </div>
          <p className="mt-0.5 hidden text-xs text-gray-500 sm:block dark:text-gray-400">
            Chat em destaque · contexto do agente abaixo do atendimento
          </p>
        </div>
        <Badge variant="info" className="shrink-0">
          {filtered.length} conversa{filtered.length === 1 ? '' : 's'}
        </Badge>
      </div>

      <div className="shrink-0 border-b border-gray-200/80 bg-slate-50/90 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_12rem_12rem] md:items-center">
          <Search
            placeholder="Buscar leads e conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
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
            options={[
              { value: 'all', label: 'Todos os status' },
              { value: 'active', label: 'Ativas' },
              { value: 'waiting', label: 'Aguardando' },
              { value: 'closed', label: 'Encerradas' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden bg-white dark:bg-gray-950">
        <aside
          className={`flex w-full shrink-0 flex-col border-r border-gray-200 md:w-72 lg:w-80 dark:border-gray-800 ${
            activeConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="flex-1 overflow-y-auto">
            {displayList.length === 0 ? (
              <ConversationsEmptyState filtered={!isInboxEmpty || hasActiveFilters} />
            ) : (
              displayList.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conversation={conv}
                  active={conv.id === activeConversationId}
                  pinned={conv.id === activeConversationId && !filtered.some((c) => c.id === conv.id)}
                  onClick={() => setActiveConversationId(conv.id)}
                />
              ))
            )}
          </div>
        </aside>

        <section className={`min-w-0 flex-1 flex-col ${activeConversationId ? 'flex' : 'hidden md:flex'}`}>
          {activeConversation ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-blue-200/60 bg-gradient-to-r from-blue-50/95 via-white/95 to-white/95 px-4 py-3 backdrop-blur dark:border-blue-900/40 dark:from-blue-950/50 dark:via-gray-950/95 dark:to-gray-950/95">
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
                      <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                        {activeConversation.customerName}
                      </h3>
                      <Badge variant={STATUS_VARIANTS[activeConversation.status]}>
                        {STATUS_LABELS[activeConversation.status]}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <ChannelBadge channel={activeConversation.channel} />
                      {activeConversation.protocol && (
                        <span className="text-xs text-gray-400">{activeConversation.protocol}</span>
                      )}
                      {activeConversation.assignedName && (
                        <span className="text-xs text-gray-500">
                          · {activeConversation.assignedName}
                          {activeConversation.department ? ` (${activeConversation.department})` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mx-3 mt-3 flex min-h-[22rem] flex-1 flex-col overflow-hidden rounded-2xl border-2 border-blue-500/35 bg-slate-50 shadow-[0_0_0_1px_rgba(59,130,246,0.12),0_18px_40px_-24px_rgba(37,99,235,0.55)] dark:border-blue-400/30 dark:bg-[#0b1220] dark:shadow-[0_0_0_1px_rgba(96,165,250,0.18),0_24px_48px_-28px_rgba(37,99,235,0.65)] sm:min-h-[26rem] lg:min-h-[32rem]">
                <div className="flex items-center justify-between border-b border-blue-200/50 px-4 py-2 dark:border-blue-900/40">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">
                    Conversa em atendimento
                  </p>
                  {messagesLoading ? (
                    <span className="text-xs text-gray-400">Carregando mensagens...</span>
                  ) : (
                    <span className="text-xs text-gray-500">{allMessages.length} mensagens</span>
                  )}
                </div>
                <div className="dashboard-grid-bg flex-1 space-y-4 overflow-y-auto p-4">
                  {isClosed && (
                    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                      Conversa encerrada. Reabra para enviar novas mensagens.
                    </div>
                  )}
                  {messagesLoading ? (
                    <Loading text="Carregando mensagens..." />
                  ) : allMessages.length === 0 ? (
                    <EmptyState
                      icon={User}
                      title="Nenhuma mensagem ainda"
                      description="Assim que o lead ou o agente enviarem mensagens, elas aparecem aqui."
                    />
                  ) : (
                    allMessages.map((msg) => (
                      <ChatBubble
                        key={msg.id}
                        message={msg}
                        customerName={activeConversation.customerName}
                      />
                    ))
                  )}
                  {isTyping && <div className="text-sm text-gray-400">Digitando...</div>}
                  <div ref={messagesEndRef} />
                </div>
                {!canReply && !isClosed && (
                  <div className="border-t border-amber-200/60 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/30">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        Assuma a conversa para liberar o envio de mensagens ao cliente.
                      </p>
                      {user && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => assumeMutation.mutate()}
                          disabled={assumeMutation.isPending}
                        >
                          <UserCheck className="h-4 w-4" /> Assumir
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                <div className="border-t border-blue-200/40 bg-white/90 dark:border-blue-900/40 dark:bg-gray-950/80">
                  <MessageInput
                    onSend={handleSend}
                    disabled={!canReply || sendMutation.isPending}
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

              <div className="space-y-4 px-3 py-4">
                <div className="flex flex-wrap gap-2">
                  {!isClosed && !isAssignedToMe && user && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => assumeMutation.mutate()}
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
                    disabled={isClosed || teamLoading || agentOptions.length === 0 || !canReply}
                  >
                    <RefreshCw className="h-4 w-4" /> Transferir
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOpenFunnel}>
                    <ShoppingCart className="h-4 w-4" /> Abrir oportunidade
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReserveOpen(true)}
                    disabled={!canReply || productOptions.length === 0}
                  >
                    <Package className="h-4 w-4" /> Reservar produto
                  </Button>
                </div>

                <div className="rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 via-white to-red-50 p-4 shadow-sm dark:border-white/10 dark:from-blue-950/30 dark:via-gray-900 dark:to-red-950/20">
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
                        <p className="mt-2 rounded-lg bg-white/70 p-3 text-sm text-gray-700 dark:bg-gray-950/50 dark:text-gray-300">
                          {aiSuggestion.suggestion}
                        </p>
                      )}
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={handleUseSuggestion}
                    disabled={aiLoading || !aiSuggestion?.suggestion || !canReply}
                  >
                    <Wand2 className="h-3.5 w-3.5" /> Usar resposta sugerida
                  </Button>
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
                  <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-gray-900/50">
                    {customerDetail ? (
                      <>
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
                          Contato
                        </p>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{customerDetail.name}</h3>
                        <p className="text-sm text-gray-500">{customerDetail.company}</p>
                        <div className="mt-3 space-y-1 text-sm">
                          <InfoRow label="Telefone" value={customerDetail.phone || activeConversation.contactPhone || '—'} />
                          <InfoRow label="Email" value={customerDetail.email || '—'} />
                          <InfoRow label="Cidade" value={customerDetail.city || '—'} />
                          <InfoRow label="Último atendimento" value={formatDateTime(customerDetail.lastService)} />
                        </div>
                        {customerDetail.notes && (
                          <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm dark:bg-amber-900/20">
                            <p className="font-medium text-amber-800 dark:text-amber-300">Observações</p>
                            <p className="mt-1 text-amber-700 dark:text-amber-400">{customerDetail.notes}</p>
                          </div>
                        )}
                        {(customerDetail.orders.length > 0 || customerDetail.purchasedProducts.length > 0) && (
                          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                            {customerDetail.orders.length > 0 && (
                              <div>
                                <h4 className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  <ShoppingCart className="h-3.5 w-3.5 text-blue-600" /> Pedidos
                                </h4>
                                {customerDetail.orders.slice(0, 3).map((o) => (
                                  <div key={o.id} className="mb-1 text-xs text-gray-500">
                                    {o.number} · {formatCurrency(o.total)}
                                  </div>
                                ))}
                              </div>
                            )}
                            {customerDetail.purchasedProducts.length > 0 && (
                              <div>
                                <h4 className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  <Package className="h-3.5 w-3.5 text-red-500" /> Produtos
                                </h4>
                                {customerDetail.purchasedProducts.slice(0, 3).map((p) => (
                                  <div key={p.id} className="mb-1 text-xs text-gray-500">
                                    {p.name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
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
                        {agentContext?.contact?.senderName && (
                          <p className="mt-1 text-xs text-gray-400">
                            Identidade agente: {agentContext.contact.senderName}
                          </p>
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
        {agentOptions.length === 0 ? (
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
        {productOptions.length === 0 ? (
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
