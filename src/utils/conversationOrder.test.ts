import type { Conversation } from '@/types';
import { describe, expect, it } from 'vitest';
import { sortConversationsByLatestMessage } from './conversationOrder';

function conversation(id: string, lastMessageAt: string): Conversation {
  return {
    id,
    customerId: id,
    customerName: id,
    lastMessage: '',
    lastMessageAt,
    status: 'active',
    unreadCount: 0,
    channel: 'whatsapp',
  };
}

describe('sortConversationsByLatestMessage', () => {
  it('keeps the newest customer conversation first regardless of status', () => {
    const olderWaiting = { ...conversation('older', '2026-09-16T10:00:00Z'), status: 'waiting' as const };
    const newerActive = conversation('newer', '2026-09-16T11:00:00Z');

    expect(sortConversationsByLatestMessage([olderWaiting, newerActive]).map((item) => item.id))
      .toEqual(['newer', 'older']);
  });

  it('does not mutate the query cache array', () => {
    const original = [conversation('a', '2026-09-16T10:00:00Z'), conversation('b', '2026-09-16T11:00:00Z')];
    sortConversationsByLatestMessage(original);
    expect(original.map((item) => item.id)).toEqual(['a', 'b']);
  });
});
