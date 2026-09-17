import { describe, expect, it } from 'vitest';
import { globalSearchPath, orderConversationPath } from './navigation';

describe('globalSearchPath', () => {
  it('routes contact searches to the conversation inbox', () => {
    expect(globalSearchPath(' João Pedro ', 'conversations'))
      .toBe('/atendimento?busca=Jo%C3%A3o%20Pedro');
  });

  it('routes order searches to the monthly order list', () => {
    expect(globalSearchPath('#25894', 'orders')).toBe('/pedidos?busca=%2325894');
  });

  it('does not navigate for an empty query', () => {
    expect(globalSearchPath('   ', 'orders')).toBeNull();
  });
});

describe('orderConversationPath', () => {
  it('opens the exact conversation evidence attached to an order', () => {
    expect(orderConversationPath({ conversationEvidence: { conversationId: 'contact/group 1' } }))
      .toBe('/atendimento?conversa=contact%2Fgroup%201');
  });

  it('does not invent a conversation when evidence is absent', () => {
    expect(orderConversationPath({ conversationEvidence: null })).toBeNull();
  });
});
