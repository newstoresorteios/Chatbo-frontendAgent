import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/utils/conversationAlerts.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
});
const { isHandoffWaiting, listHandoffWaiting, isAttendingConversation, filterInboxConversations } =
  await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const conversation = (id, updates = {}) => ({
  id, customerId: id, customerName: `Cliente ${id}`, lastMessage: 'Preciso de atendimento',
  lastMessageAt: '2026-09-15T12:00:00Z', status: 'waiting', unreadCount: 1,
  channel: 'whatsapp', ...updates,
});

test('the waiting queue excludes assigned, active and closed conversations', () => {
  const rows = [conversation('waiting'), conversation('assigned', { assignedTo: 'someone' }),
    conversation('active', { status: 'active' }), conversation('closed', { status: 'closed' })];
  assert.deepEqual(listHandoffWaiting(rows).map((row) => row.id), ['waiting']);
});

test('reading or selecting a conversation does not claim it', () => {
  const read = conversation('waiting', { unreadCount: 0 });
  assert.equal(isHandoffWaiting(read), true);
  assert.equal(isAttendingConversation(read, 'me'), false);
});

test('only an open conversation assigned to the current operator pauses the alert', () => {
  const owned = conversation('owned', { assignedTo: 'me', status: 'active' });
  assert.equal(isAttendingConversation(owned, 'me'), true);
  assert.equal(isAttendingConversation(owned, 'other'), false);
  assert.equal(isAttendingConversation(owned, undefined), false);
  assert.equal(isAttendingConversation(undefined, 'me'), false);
  assert.equal(isAttendingConversation({ ...owned, status: 'closed' }, 'me'), false);
  assert.equal(isAttendingConversation({ ...owned, status: 'waiting' }, 'me'), true);
});

test('claiming one conversation removes only it from the queue; claiming the last empties the queue', () => {
  const rows = [conversation('one'), conversation('two')];
  const claimed = rows.map((row) => row.id === 'one' ? { ...row, assignedTo: 'me', status: 'active' } : row);
  assert.deepEqual(listHandoffWaiting(claimed).map((row) => row.id), ['two']);
  assert.equal(isAttendingConversation(claimed[0], 'me'), true);
  assert.deepEqual(listHandoffWaiting(claimed.map((row) => ({ ...row, assignedTo: 'me', status: 'active' }))), []);
});

test('the waiting filter agrees with the alert count and does not include a selected active conversation', () => {
  const rows = [conversation('selected', { status: 'active', assignedTo: 'me' }), conversation('waiting'), conversation('closed', { status: 'closed' })];
  assert.deepEqual(filterInboxConversations(rows, { status: 'waiting' }), listHandoffWaiting(rows));
  assert.deepEqual(filterInboxConversations(rows, { status: 'waiting' }).map((row) => row.id), ['waiting']);
});

test('channel and text filters combine with waiting without changing the original list', () => {
  const rows = [conversation('one', { customerName: 'Maria' }),
    conversation('two', { customerName: 'Maria', channel: 'instagram' }),
    conversation('three', { customerName: 'Maria', status: 'active' })];
  assert.deepEqual(filterInboxConversations(rows, { status: 'waiting', channel: 'instagram', search: ' MARIA ' }).map((row) => row.id), ['two']);
  assert.deepEqual(filterInboxConversations(rows, {}), rows);
  assert.equal(listHandoffWaiting(rows).length, 2);
  assert.deepEqual(filterInboxConversations(rows, { status: 'closed' }), []);
});
