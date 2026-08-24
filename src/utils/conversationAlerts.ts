import type { Conversation } from '@/types';

export function isHandoffWaiting(conversation: Conversation): boolean {
  return conversation.status === 'waiting';
}

export function listHandoffWaiting(conversations: Conversation[]): Conversation[] {
  return conversations.filter(isHandoffWaiting);
}
