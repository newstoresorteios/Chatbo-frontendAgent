/** Authenticated event wait; the backend derives company scope from the session. */
import { api } from './api';

export interface InboxEvent {
  cursor: string;
  changed: boolean;
  realtime: boolean;
  incoming?: { cursor: string; at: number };
}

export async function waitForInboxEvent(cursor: string, signal: AbortSignal): Promise<InboxEvent> {
  const { data } = await api.get<InboxEvent>('/conversas/events', {
    params: { cursor }, signal, timeout: 25_000,
  });
  if (typeof data?.cursor !== 'string' || typeof data.changed !== 'boolean') {
    throw new Error('Invalid inbox event');
  }
  return data;
}
