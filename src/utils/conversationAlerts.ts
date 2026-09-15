import type { Conversation } from '@/types';

export function isHandoffWaiting(conversation: Conversation): boolean {
  return conversation.status === 'waiting' && !conversation.assignedTo;
}

export function listHandoffWaiting(conversations: Conversation[]): Conversation[] {
  return conversations.filter(isHandoffWaiting);
}

export function isAttendingConversation(conversation: Conversation | undefined, userId: string | undefined): boolean {
  return Boolean(userId && conversation && conversation.status !== 'closed' && conversation.assignedTo === userId);
}

export function filterInboxConversations(
  conversations: Conversation[],
  { channel = 'all', status = 'all', search = '' }: { channel?: string; status?: string; search?: string },
): Conversation[] {
  const query = search.trim().toLocaleLowerCase('pt-BR');
  return conversations.filter((conversation) => {
    const matchesStatus = status === 'all'
      || (status === 'waiting' ? isHandoffWaiting(conversation) : conversation.status === status);
    const matchesChannel = channel === 'all' || conversation.channel === channel;
    const matchesSearch = !query || [conversation.customerName, conversation.lastMessage]
      .some((value) => (value || '').toLocaleLowerCase('pt-BR').includes(query));
    return matchesStatus && matchesChannel && matchesSearch;
  });
}
