import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryObserver, useQuery, type QueryObserverOptions } from '@tanstack/react-query';
import { useConversationAgentContext } from './useQueries';
import type { ConversationAgentContext } from '@/types';

const scope = vi.hoisted(() => ({
  id: 'workspace-a', user: { id: 'operator-a' } as { id: string } | null, isLoading: false,
}));

vi.mock('@/contexts/WorkspaceContext', () => ({ useWorkspace: () => scope }));
vi.mock('@/services/agentRuntime.service', () => ({
  agentRuntimeService: { getConversationAgentContext: vi.fn() },
}));
vi.mock('@tanstack/react-query', async (importOriginal) => ({
  ...await importOriginal<typeof import('@tanstack/react-query')>(),
  useQuery: vi.fn(),
}));

// Use the hook's real options in a persistent TanStack observer, so switching
// keys exercises the same previous-data behavior as switching an open panel.
function options(conversationId: string | null, enabled = true) {
  useConversationAgentContext(conversationId, enabled);
  return vi.mocked(useQuery).mock.lastCall![0] as QueryObserverOptions<ConversationAgentContext>;
}

const previous: ConversationAgentContext = {
  conversationId: 'conversation-a', senderKey: 'private-sender', contact: null, status: null,
  memories: [], pixPayments: [], recentResponses: [],
};

describe('agent context scope changes', () => {
  let client: QueryClient;
  let observer: QueryObserver<ConversationAgentContext> | undefined;

  beforeEach(() => {
    scope.id = 'workspace-a';
    scope.user = { id: 'operator-a' };
    scope.isLoading = false;
    vi.clearAllMocks();
    client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  });

  afterEach(() => {
    observer?.destroy();
    observer = undefined;
    client.clear();
  });

  function openPrevious() {
    const initial = options('conversation-a');
    client.setQueryData(initial.queryKey!, previous);
    observer = new QueryObserver(client, initial);
    expect(observer.getCurrentResult().data).toEqual(previous);
    return observer;
  }

  it('clears the previous conversation while the next context is pending', () => {
    const panel = openPrevious();
    panel.setOptions(options('conversation-b'));
    expect(panel.getCurrentResult().data).toBeUndefined();
    expect(panel.getCurrentResult().isPlaceholderData).toBe(false);
  });

  it('does not reuse cached data for the same conversation in another workspace', () => {
    const panel = openPrevious();
    scope.id = 'workspace-b';
    panel.setOptions(options('conversation-a'));
    expect(panel.getCurrentResult().data).toBeUndefined();
  });

  it('does not reuse cached data for another authenticated operator', () => {
    const panel = openPrevious();
    scope.user = { id: 'operator-b' };
    panel.setOptions(options('conversation-a'));
    expect(panel.getCurrentResult().data).toBeUndefined();
  });

  it('does not request data until the user and workspace are resolved', () => {
    scope.id = 'legacy';
    expect(options('conversation-a').enabled).toBe(false);
    scope.id = '';
    expect(options('conversation-a').enabled).toBe(false);
    scope.id = 'workspace-a';
    scope.user = null;
    expect(options('conversation-a').enabled).toBe(false);
    scope.user = { id: 'operator-a' };
    scope.isLoading = true;
    expect(options('conversation-a').enabled).toBe(false);
    scope.isLoading = false;
    expect(options('conversation-a').enabled).toBe(true);
    expect(options(null).enabled).toBe(false);
    expect(options('conversation-a', false).enabled).toBe(false);
  });

  it('does not retry an authorization failure', () => {
    const retry = options('conversation-a').retry;
    if (typeof retry !== 'function') throw new Error('Expected retry predicate');
    for (const status of [401, 403, 404, 501]) {
      const error = Object.assign(new Error('request denied'), { response: { status } });
      expect(retry(0, error)).toBe(false);
    }
    expect(retry(0, new Error('temporary network error'))).toBe(true);
  });
});
