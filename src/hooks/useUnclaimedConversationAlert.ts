import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { isAttendingConversation, listHandoffWaiting } from '@/utils/conversationAlerts';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useConversations } from './useQueries';

export function useUnclaimedConversationAlert() {
  const { user } = useAuth();
  const { activeConversationId } = useChat();
  const { pathname } = useLocation();
  const { data: conversations } = useConversations({ live: true });
  const waiting = useMemo(
    () => listHandoffWaiting(conversations ?? []),
    [conversations],
  );
  const active = waiting.length > 0;
  const inInbox = pathname === '/atendimento' || pathname === '/conversas';
  const isAttending = inInbox && isAttendingConversation(
    conversations?.find((conversation) => conversation.id === activeConversationId), user?.id,
  );

  return {
    active,
    shouldFlash: active && !isAttending,
    isAttending,
    inInbox,
    waiting,
    count: waiting.length,
  };
}
