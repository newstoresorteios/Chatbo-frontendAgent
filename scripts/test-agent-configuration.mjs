import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

// Use the existing TypeScript compiler; no extra test runtime is required.
const helpSource = await readFile(new URL('../src/features/agent-configuration/configurationGuidance.ts', import.meta.url), 'utf8');
const helpJS = ts.transpileModule(helpSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const helpUrl = `data:text/javascript;base64,${Buffer.from(helpJS).toString('base64')}`;
const { getConfigurationGuidance } = await import(helpUrl);
const source = (await readFile(new URL('../src/features/agent-configuration/configurationFields.ts', import.meta.url), 'utf8')).replace("'./configurationGuidance'", JSON.stringify(helpUrl));
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { groupConfigurationFields, changedConfigurationValues, restoreConfigurationValues, configurationFieldError } =
  await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const fields = [
  { key: 'historyTurns', label: 'Histórico', description: 'Contexto da conversa', group: 'Contexto', type: 'integer', min: 4, max: 40 },
  { key: 'acceptsTradeIn', label: 'Permuta', description: 'Aceita avaliação humana', group: 'Políticas comerciais', type: 'boolean' },
  { key: 'message.greeting', label: 'Saudação', description: 'Início da conversa', group: 'Mensagens de atendimento', type: 'textarea', target: 'message' },
  { key: 'agentCanAppraise', label: 'Avaliação de preço', description: '', group: 'Políticas comerciais', type: 'boolean', readOnly: true },
  { key: 'newSetting', label: 'Novo campo', description: '', group: 'Nova categoria', type: 'number', min: 0, max: 1 },
];
const published = { historyTurns: 12, acceptsTradeIn: true, 'message.greeting': 'Olá, nossa loja entrega em Curitiba.', agentCanAppraise: false, newSetting: 0.5 };
const keys = (groups) => groups.flatMap(([, items]) => items.map((item) => item.key));

test('published catalog guidance overrides local copy without new frontend mappings', () => {
  const field = { ...fields[0], description: 'Descrição publicada pelo catálogo.', whenUsed: 'Uso informado pelo banco.', group: 'Qualidade e custo do agente' };
  assert.deepEqual(getConfigurationGuidance(field), { label: field.label, purpose: field.description, whenUsed: field.whenUsed, section: field.group });
});

test('every current catalog field has purpose and a documented usage point', async () => {
  const catalog = JSON.parse(await readFile(new URL('./fixtures/agent-configuration-fields.json', import.meta.url), 'utf8'));
  const missing = catalog.filter((field) => getConfigurationGuidance(field).section === 'Outras configurações');
  assert.deepEqual(missing.map((field) => field.key), []);
  for (const field of catalog) {
    const guide = getConfigurationGuidance(field);
    assert.ok(guide.label && guide.purpose.length > 30 && guide.whenUsed.length > 20, field.key);
  }
});

test('search includes purpose and when the field is used', () => {
  assert.deepEqual(keys(groupConfigurationFields(fields, published, { search: 'peças' })), ['agentCanAppraise']);
});

test('structured values reject invalid credit bands and preserve valid knowledge', () => {
  const field = { type: 'textarea', valueSchema: 'creditBands' };
  assert.equal(configurationFieldError(field, '[[5000,25000,150000],[25100,60000,350000]]'), undefined);
  assert.ok(configurationFieldError(field, '[[5000,25000,150000],[20000,60000,350000]]'));
  assert.ok(configurationFieldError(field, '[[null,25000,150000]]'));
  assert.ok(configurationFieldError(field, '[[5000,25000,20000]]'));
  const knowledge = { ...field, valueSchema: 'institutionalKnowledge' };
  assert.equal(configurationFieldError(knowledge, JSON.stringify([{ title: 'Garantia', body: 'Consulte a garantia oficial.', cues: ['garantia'], policyKey: null }])), undefined);
  assert.ok(configurationFieldError(knowledge, JSON.stringify([{ title: '', body: 'Texto', cues: [''] }])));
});

test('all catalog fields and newly introduced categories are discoverable without a filter', () => {
  const groups = groupConfigurationFields(fields, published);
  assert.equal(groups[0][0], 'Políticas comerciais');
  assert.deepEqual(new Set(keys(groups)), new Set(fields.map((field) => field.key)));
});

test('search matches accents, identifiers and the actual message content', () => {
  assert.deepEqual(keys(groupConfigurationFields(fields, published, { search: 'historico' })), ['historyTurns']);
  assert.deepEqual(keys(groupConfigurationFields(fields, published, { search: 'message.greeting' })), ['message.greeting']);
  assert.deepEqual(keys(groupConfigurationFields(fields, published, { search: 'loja CURITIBA' })), ['message.greeting']);
  assert.deepEqual(keys(groupConfigurationFields(fields, published, { search: 'curitiba', category: 'Contexto' })), []);
});

test('publishing includes only changed editable catalog fields and preserves false and zero', () => {
  const values = { ...published, acceptsTradeIn: false, newSetting: 0, agentCanAppraise: true, removedSetting: 'old' };
  assert.deepEqual(changedConfigurationValues(fields, values, published), { acceptsTradeIn: false, newSetting: 0 });
  assert.deepEqual(changedConfigurationValues(fields, { ...published }, published), {});
});

test('review filter works across categories and keeps drafts hidden by another filter', () => {
  const values = { ...published, historyTurns: 20, acceptsTradeIn: false };
  assert.deepEqual(new Set(keys(groupConfigurationFields(fields, values, { changedOnly: true, published }))), new Set(['historyTurns', 'acceptsTradeIn']));
  assert.deepEqual(keys(groupConfigurationFields(fields, values, { category: 'Contexto', changedOnly: true, published })), ['historyTurns']);
  assert.equal(values.acceptsTradeIn, false);
});

test('restoration ignores removed/protected fields and preserves new fields absent from old versions', () => {
  const previous = { historyTurns: 6, acceptsTradeIn: false, agentCanAppraise: true, removedSetting: 'old' };
  const next = restoreConfigurationValues(fields, published, previous);
  assert.deepEqual(next, { ...published, historyTurns: 6, acceptsTradeIn: false });
  assert.equal(published.historyTurns, 12);
});

test('blank numbers do not become zero; integer, range, message and JSON validation reject invalid edits', () => {
  assert.ok(configurationFieldError(fields[0], ''));
  assert.ok(configurationFieldError(fields[0], 1.5));
  assert.ok(configurationFieldError(fields[0], 41));
  assert.equal(configurationFieldError(fields[0], 20), undefined);
  assert.equal(configurationFieldError(fields[4], 0.15), undefined);
  assert.ok(configurationFieldError(fields[2], '  '));
  const structured = { ...fields[2], valueSchema: 'greetingVariants' };
  assert.ok(configurationFieldError(structured, 'invalid JSON'));
  assert.ok(configurationFieldError(structured, '[]'));
  assert.equal(configurationFieldError(structured, '["Olá"]'), undefined);
});
