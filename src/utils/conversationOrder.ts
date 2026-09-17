import type { Conversation } from '@/types';

/** Assignment and status never override the time of the latest message. */
export function sortConversationsByLatestMessage(conversations: Conversation[]): Conversation[] {
  const timestamp = (value: string) => {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  return [...conversations].sort((a, b) =>
    timestamp(b.lastMessageAt) - timestamp(a.lastMessageAt) || a.id.localeCompare(b.id),
  );
}
