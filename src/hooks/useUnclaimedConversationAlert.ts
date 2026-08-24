import { listHandoffWaiting } from '@/utils/conversationAlerts';
import { useEffect, useMemo, useRef } from 'react';
import { useConversations } from './useQueries';

const BASE_TITLE = 'ChatBô';

export function useUnclaimedConversationAlert() {
  const { data: conversations } = useConversations({ live: true });
  const waiting = useMemo(
    () => listHandoffWaiting(conversations ?? []),
    [conversations],
  );
  const active = waiting.length > 0;
  const baseTitleRef = useRef(BASE_TITLE);

  useEffect(() => {
    const current = document.title.replace(/^🔴\s*\(\d+\)\s*/, '').trim();
    baseTitleRef.current = current || BASE_TITLE;
  }, []);

  useEffect(() => {
    if (!active) {
      document.title = baseTitleRef.current;
      return undefined;
    }

    let highlight = true;
    const updateTitle = () => {
      document.title = highlight
        ? `🔴 (${waiting.length}) Aguardando atendimento — ${baseTitleRef.current}`
        : baseTitleRef.current;
      highlight = !highlight;
    };
    updateTitle();
    const timer = window.setInterval(updateTitle, 900);
    return () => {
      window.clearInterval(timer);
      document.title = baseTitleRef.current;
    };
  }, [active, waiting.length]);

  return {
    active,
    waiting,
    count: waiting.length,
  };
}
