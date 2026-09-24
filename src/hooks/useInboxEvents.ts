import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { USE_MOCK } from '@/config/runtime';
import { waitForInboxEvent } from '@/services/inboxEvents';

/** One connection per mounted Central; existing polling remains the safety net. */
export function useInboxEvents(sessionKey: string | null) {
  const queries = useQueryClient();
  useEffect(() => {
    if (!sessionKey || USE_MOCK) return;
    let stopped = false;
    let controller: AbortController | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let cursor = '';

    const refresh = async () => {
      await Promise.all([
        queries.invalidateQueries({ queryKey: ['conversations'] }, { cancelRefetch: false }),
        queries.invalidateQueries({ queryKey: ['messages'], refetchType: 'active' }, { cancelRefetch: false }),
      ]);
    };
    const connect = async () => {
      if (stopped || document.hidden || controller) return;
      const active = new AbortController();
      controller = active;
      try {
        while (!stopped && !active.signal.aborted && !document.hidden) {
          const event = await waitForInboxEvent(cursor, active.signal);
          if (stopped || active.signal.aborted) break;
          cursor = event.cursor;
          if (event.changed) await refresh();
        }
      } catch {
        // Polling continues; retry also handles old backends during rolling deploys.
      } finally {
        if (controller === active) controller = null;
        if (!stopped && !document.hidden) retryTimer = setTimeout(() => void connect(), 3_000);
      }
    };
    const visibility = () => {
      clearTimeout(retryTimer);
      if (document.hidden) controller?.abort();
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
  }, [sessionKey, queries]);
}
