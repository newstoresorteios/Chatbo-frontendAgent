import type { AgentPersona } from '@/features/persona/types';

export const PERSONA_ACTIVATION_FIELD_LABELS: Record<string, string> = {
  name: 'Nome da persona',
  role: 'Função',
  segment: 'Segmento',
  language: 'Idioma',
  tone: 'Tom de voz',
  greeting: 'Saudação inicial',
  targetAudience: 'Público-alvo',
  salesGoals: 'Objetivos de venda',
  qualificationRules: 'Qualificação (perguntas, descoberta ou critérios de oportunidade)',
  restrictions: 'Informações que não pode inventar',
};

function filledText(value: string | undefined | null): boolean {
  return Boolean(value?.trim());
}

function filledList(...groups: Array<string[] | undefined | string | null>): boolean {
  return groups.some((group) => {
    if (typeof group === 'string') return Boolean(group.trim());
    return (group ?? []).some((item) => Boolean(item?.trim()));
  });
}

export function getPersonaActivationGaps(persona: AgentPersona): string[] {
  const missing: string[] = [];
  if (!filledText(persona.name)) missing.push('name');
  if (!filledText(persona.role)) missing.push('role');
  if (!filledText(persona.segment)) missing.push('segment');
  if (!filledText(persona.language || 'pt-BR')) missing.push('language');
  if (!filledText(persona.tone)) missing.push('tone');
  if (!filledText(persona.greeting)) missing.push('greeting');
  if (!filledText(persona.targetAudience)) missing.push('targetAudience');
  if (!filledList(persona.salesGoals, persona.commercialPriorities)) missing.push('salesGoals');
  if (!filledList(
    persona.qualificationRules,
    persona.requiredQuestions,
    persona.discoveryFields,
    persona.opportunityCriteria,
  )) {
    missing.push('qualificationRules');
  }
  if (!filledList(
    persona.restrictions,
    persona.forbiddenSubjects,
    persona.forbiddenPromises,
    persona.nonInventableInformation,
    persona.humanOnlyCommercialTerms,
  )) {
    missing.push('restrictions');
  }
  return missing;
}

export function personaActivationGapLabels(persona: AgentPersona): string[] {
  return getPersonaActivationGaps(persona).map(
    (field) => PERSONA_ACTIVATION_FIELD_LABELS[field] ?? field,
  );
}
