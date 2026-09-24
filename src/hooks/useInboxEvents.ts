import { useEffect, useRef } from 'react';
import { shouldSound, type IncomingSignal } from '@/utils/inboxSound';
import { useQueryClient } from '@tanstack/react-query';
import { USE_MOCK } from '@/config/runtime';
import { waitForInboxEvent } from '@/services/inboxEvents';

/** One connection per mounted Central; existing polling remains the safety net. */
export function useInboxEvents(sessionKey: string | null, onIncoming?: () => void, listenInBackground = false) {
  const queries = useQueryClient();
  const incomingCallback = useRef(onIncoming);
  useEffect(() => { incomingCallback.current = onIncoming; }, [onIncoming]);
  useEffect(() => {
    if (!sessionKey || USE_MOCK) return;
    let stopped = false;
    let controller: AbortController | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let cursor = '';
    let incoming: IncomingSignal | undefined;

    const refresh = async () => {
      await Promise.all([
        queries.invalidateQueries({ queryKey: ['conversations'] }, { cancelRefetch: false }),
        queries.invalidateQueries({ queryKey: ['messages'], refetchType: 'active' }, { cancelRefetch: false }),
      ]);
    };
    const connect = async () => {
      if (stopped || (document.hidden && !listenInBackground) || controller) return;
      const active = new AbortController();
      controller = active;
      try {
        while (!stopped && !active.signal.aborted && (!document.hidden || listenInBackground)) {
          const event = await waitForInboxEvent(cursor, active.signal);
          if (stopped || active.signal.aborted) break;
          cursor = event.cursor;
          if (shouldSound(incoming, event.incoming, Date.now())) incomingCallback.current?.();
          incoming = event.incoming;
          if (event.changed) await refresh();
        }
      } catch {
        // Polling continues; retry also handles old backends during rolling deploys.
      } finally {
        if (controller === active) controller = null;
        if (!stopped && (!document.hidden || listenInBackground)) retryTimer = setTimeout(() => void connect(), 3_000);
      }
    };
    const visibility = () => {
      clearTimeout(retryTimer);
      if (document.hidden && !listenInBackground) controller?.abort();
      else void connect();
    };
    document.addEventListener('visibilitychange', visibility);
    void connect();
    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      controller?.abort();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [sessionKey, queries, listenInBackground]);
}
