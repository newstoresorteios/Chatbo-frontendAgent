import { useUnclaimedConversationAlert } from '@/hooks/useUnclaimedConversationAlert';

export function UnclaimedConversationAlert() {
  const { active, count } = useUnclaimedConversationAlert();
  if (!active) return null;

  return (
    <>
      <div
        className="handoff-alert-overlay pointer-events-none fixed inset-0 z-[100] animate-handoff-flash"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed top-16 right-4 z-[101] rounded-xl border border-red-500/40 bg-red-950/90 px-4 py-2 text-sm font-semibold text-red-100 shadow-lg shadow-red-900/40 backdrop-blur-sm"
        role="status"
        aria-live="assertive"
      >
        {count === 1
          ? '1 conversa aguardando atendimento humano'
          : `${count} conversas aguardando atendimento humano`}
      </div>
    </>
  );
}
