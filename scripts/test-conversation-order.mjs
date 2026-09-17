import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/utils/conversationOrder.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { sortConversationsByLatestMessage: sort } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const conversation = (id, lastMessageAt, extra = {}) => ({ id, lastMessageAt, ...extra });

test('newer messages precede old assigned conversations regardless of status', () => {
  const rows = [
    conversation('old-mine', '2026-08-19T12:00:00Z', { assignedTo: 'me', status: 'active' }),
    conversation('newest', '2026-09-16T12:00:00Z', { status: 'closed' }),
    conversation('middle', '2026-09-15T12:00:00Z', { status: 'waiting' }),
  ];
  assert.deepEqual(sort(rows).map(row => row.id), ['newest', 'middle', 'old-mine']);
  assert.equal(rows[0].id, 'old-mine', 'does not mutate the query cache');
});

test('orders by actual instant, with stable ties and missing dates last', () => {
  assert.deepEqual(sort([
    conversation('missing', ''), conversation('b', '2026-09-16T09:00:00-03:00'),
    conversation('a', '2026-09-16T12:00:00Z'), conversation('new', '2026-09-16T11:00:00-03:00'),
  ]).map(row => row.id), ['new', 'a', 'b', 'missing']);
});

test('an incoming or sent message moves its conversation to the top', () => {
  const rows = [conversation('a', '2026-09-16T12:00:00Z'), conversation('b', '2026-09-15T12:00:00Z')];
  assert.equal(sort(rows)[0].id, 'a');
  assert.equal(sort(rows.map(row => row.id === 'b' ? { ...row, lastMessageAt: '2026-09-16T13:00:00Z' } : row))[0].id, 'b');
});
