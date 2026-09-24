import { describe, expect, it, vi } from 'vitest';
vi.mock('./api', () => ({ api: { get: vi.fn() } }));
import { api } from './api';
import { waitForInboxEvent } from './inboxEvents';

describe('inbox event transport', () => {
  it('uses authenticated API, cancellation and cursor only (no workspace or token in URL)', async () => {
    const event = { cursor: 'next', changed: true, realtime: true };
    vi.mocked(api.get).mockResolvedValueOnce({ data: event });
    const signal = new AbortController().signal;
    expect(await waitForInboxEvent('previous', signal)).toEqual(event);
    expect(api.get).toHaveBeenCalledWith('/conversas/events', {
      params: { cursor: 'previous' }, signal, timeout: 25_000,
    });
  });
  it('rejects unexpected responses so polling can remain in use', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: '<html />' });
    await expect(waitForInboxEvent('', new AbortController().signal)).rejects.toThrow('Invalid inbox event');
  });
});
