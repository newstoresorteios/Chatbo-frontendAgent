import { useUnclaimedConversationAlert } from '@/hooks/useUnclaimedConversationAlert';
import { useChat } from '@/contexts/ChatContext';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export function UnclaimedConversationAlert() {
  const { active, count, shouldFlash, inInbox } = useUnclaimedConversationAlert();
  const { showWaitingQueue } = useChat();
  const baseTitle = useRef(document.title || 'ChatBô');

  // Only this component owns the title timer; badge consumers never start one.
  useEffect(() => {
    const originalTitle = baseTitle.current;
    if (!shouldFlash) {
      document.title = originalTitle;
      return;
    }
    let highlight = true;
    const updateTitle = () => {
      document.title = highlight ? `🔴 (${count}) Aguardando atendimento — ${originalTitle}` : originalTitle;
      highlight = !highlight;
    };
    updateTitle();
    const timer = window.setInterval(updateTitle, 900);
    return () => { window.clearInterval(timer); document.title = originalTitle; };
  }, [count, shouldFlash]);

  if (!active) return null;

  return (
    <>
      {shouldFlash && <div
        className="handoff-alert-overlay pointer-events-none fixed inset-0 z-[100] animate-handoff-flash"
        aria-hidden
      />}
      {!inInbox && <Link
        to="/atendimento?fila=aguardando"
        onClick={showWaitingQueue}
        className="fixed top-16 right-4 z-[101] max-w-[calc(100vw-2rem)] rounded-xl border border-red-500/40 bg-red-950/90 px-4 py-2 text-sm font-semibold text-red-100 shadow-lg shadow-red-900/40 backdrop-blur-sm hover:bg-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
      >
        {count === 1
          ? '1 conversa aguardando atendimento humano'
          : `${count} conversas aguardando atendimento humano`}
        <span className="ml-2 underline">Ver fila</span>
      </Link>}
    </>
  );
}
