import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
// Isolate the pure history merge without loading API clients or UI mocks.
const source = (await readFile(new URL('../src/services/conversations.service.ts', import.meta.url), 'utf8'))
  .replace(/^import .*;\r?\n/gm, '')
  .replace('let messagesStore = { ...mockMessages };', 'let messagesStore = {};');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { mergeConversationMessages } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const message = (id, conversationId = 'old') => ({ id, conversationId, content: 'Olá', sender: 'customer', timestamp: '2026-09-15T12:00:00Z', status: 'sent' });

test('identical text in different persisted messages or sessions is preserved', () => {
  const combined = mergeConversationMessages([message('001')], [message('002', 'new'), message('003', 'new')]);
  assert.deepEqual(combined.map((m) => m.id), ['001', '002', '003']);
});
test('older messages at the same timestamp sort before the cursor', () => {
  assert.deepEqual(mergeConversationMessages([message('003')], [message('001'), message('002')]).map((m) => m.id), ['001', '002', '003']);
});
test('repeated poll updates delivery status without adding another message', () => {
  const result = mergeConversationMessages([message('001')], [{ ...message('001'), status: 'read' }]);
  assert.equal(result.length, 1);
  assert.equal(result[0].status, 'read');
});
