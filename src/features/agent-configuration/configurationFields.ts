import type { AgentConfigurationField, AgentConfigurationValue } from '@/services/agentConfiguration.service';

export type ConfigurationValues = Record<string, AgentConfigurationValue>;

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Políticas comerciais': 'Pagamento, checkout, permuta, links oficiais e informações da loja.',
  'Mensagens e instruções': 'Textos de orientação e respostas para situações específicas.',
  'Mensagens de atendimento': 'Mensagens usadas em cada etapa da conversa e nas consultas do agente.',
  'Respostas': 'Limites para as respostas enviadas ao cliente.',
  'Contexto': 'Histórico considerado para entender e continuar a conversa.',
  'Catálogo': 'Busca, seleção, atualização e recomendação de produtos.',
  'Atendimento': 'Memória, conhecimento, transferência humana, áudio, imagens e processamento das conversas.',
  'Motor e limites': 'Modelos de IA, tempo de resposta e limites de processamento.',
  'Aprendizado': 'Análise de atendimentos e aplicação de melhorias.',
  'Canário e rollback': 'Teste gradual de melhorias e reversão quando a qualidade cai.',
  'Observabilidade': 'Detalhamento dos registros de execução do agente.',
};

const categoryOrder = Object.keys(CATEGORY_DESCRIPTIONS);

export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

export function groupConfigurationFields(
  fields: AgentConfigurationField[],
  values: ConfigurationValues,
  { search = '', category = '', changedOnly = false, published = {} as ConfigurationValues } = {},
): Array<[string, AgentConfigurationField[]]> {
  const words = normalizeSearch(search.trim()).split(/\s+/).filter(Boolean);
  const groups = new Map<string, AgentConfigurationField[]>();
  for (const field of fields) {
    if (category && field.group !== category) continue;
    if (changedOnly && Object.is(values[field.key], published[field.key])) continue;
    const text = normalizeSearch([field.label, field.description, field.key, field.group, values[field.key]].join(' '));
    if (!words.every((word) => text.includes(word))) continue;
    const group = groups.get(field.group) ?? [];
    group.push(field);
    groups.set(field.group, group);
  }
  const rank = (group: string) => categoryOrder.includes(group) ? categoryOrder.indexOf(group) : categoryOrder.length;
  return [...groups.entries()].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b, 'pt-BR'));
}

export function changedConfigurationValues(
  fields: AgentConfigurationField[], values: ConfigurationValues, published: ConfigurationValues,
): ConfigurationValues {
  return Object.fromEntries(fields
    .filter((field) => !field.readOnly && field.key in values && !Object.is(values[field.key], published[field.key]))
    .map((field) => [field.key, values[field.key]]));
}

export function restoreConfigurationValues(
  fields: AgentConfigurationField[], published: ConfigurationValues, previous: ConfigurationValues,
): ConfigurationValues {
  const next = { ...published };
  for (const field of fields) {
    if (!field.readOnly && field.key in previous) next[field.key] = previous[field.key];
  }
  return next;
}

export function configurationFieldError(field: AgentConfigurationField, value: AgentConfigurationValue): string | undefined {
  if (field.type === 'integer' || field.type === 'number') {
    if (typeof value !== 'number' || !Number.isFinite(value)) return 'Informe um número.';
    if (field.type === 'integer' && !Number.isInteger(value)) return 'Informe um número inteiro.';
    if (field.min !== undefined && value < field.min) return `O mínimo permitido é ${field.min}.`;
    if (field.max !== undefined && value > field.max) return `O máximo permitido é ${field.max}.`;
  }
  if (field.type === 'select' && !field.options?.some((option) => option.value === value)) return 'Selecione uma opção válida.';
  if (typeof value === 'string' && value.length > (field.maxLength ?? 20000)) return 'O texto ultrapassa o limite permitido.';
  if (field.target === 'message' && (typeof value !== 'string' || !value.trim())) return 'Preencha a mensagem.';
  if (field.valueSchema) {
    try {
      const parsed: unknown = JSON.parse(String(value));
      if (!Array.isArray(parsed) || !parsed.length || parsed.length > 100) return 'Informe uma lista JSON com 1 a 100 itens.';
    } catch {
      return 'Revise o formato JSON antes de publicar.';
    }
  }
}
