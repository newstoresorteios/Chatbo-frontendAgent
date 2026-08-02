import { api } from '@/services/api';
import type { AgentPersona, PersonaExample, PersonaStatus, PersonaTone, PersonaVersion, PersonaVersionSnapshot } from '@/features/persona/types';

type ObjectionPayload = {
  items?: string[];
  custom?: string[];
};

interface PersonaApiPayload {
  name?: string | null;
  role?: string | null;
  segment?: string | null;
  language?: string | null;
  tone?: string | null;
  toneDetails?: string | null;
  greeting?: string | null;
  introduction?: string | null;
  customerAddressStyle?: string | null;
  closingMessage?: string | null;
  targetAudience?: string | null;
  customerProfile?: string | null;
  salesGoals?: string[];
  qualificationRules?: string[];
  opportunityCriteria?: string[];
  humanHandoffCriteria?: string[];
  objectionHandling?: ObjectionPayload;
  upsellRules?: string[];
  recommendationRules?: string[];
  escalationRules?: string[];
  restrictions?: string[];
  examples?: PersonaExample[];
}

interface PersonaApiResponse extends PersonaApiPayload {
  id: string;
  workspaceId: string;
  status: PersonaStatus;
  version: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  activatedAt?: string | null;
  deactivatedAt?: string | null;
}

interface PersonaListResponse {
  items: PersonaApiResponse[];
  total: number;
  activePersonaId?: string | null;
}

interface PersonaVersionApiResponse {
  id: string;
  personaId: string;
  version: number;
  snapshot: PersonaVersionSnapshot;
  changeType: PersonaVersion['changeType'];
  createdBy?: string | null;
  createdAt?: string | null;
}

export interface PersonaListResult {
  items: AgentPersona[];
  total: number;
  activePersonaId?: string;
}

export interface PersonaTestRequest {
  persona: AgentPersona;
  customerMessage: string;
  optionalContext?: {
    workspaceName?: string;
  };
}

export interface PersonaTestResponse {
  response: string;
  warnings: string[];
  generatedAt: string;
  persisted: false;
  activated: false;
}

export const personaKeys = {
  list: (workspaceId: string) => ['personas', workspaceId] as const,
  detail: (workspaceId: string, personaId: string) => ['persona', workspaceId, personaId] as const,
  versions: (workspaceId: string, personaId: string) => ['persona-versions', workspaceId, personaId] as const,
  version: (workspaceId: string, personaId: string, version: number) => ['persona-version', workspaceId, personaId, version] as const,
};

function compact(values: Array<string | undefined | null>): string[] {
  return values.map((item) => item?.trim() ?? '').filter(Boolean);
}

function compactList(values: string[] | undefined): string[] {
  return compact(values ?? []);
}

function parseTone(value: string | null | undefined): PersonaTone {
  const allowed: PersonaTone[] = ['professional', 'consultative', 'objective', 'friendly', 'sophisticated', 'technical', 'informal', 'custom'];
  return allowed.includes(value as PersonaTone) ? value as PersonaTone : 'professional';
}

function parseObjections(value: ObjectionPayload | undefined): { objectionHandling: string[]; customObjections: string[] } {
  return {
    objectionHandling: compactList(value?.items),
    customObjections: compactList(value?.custom),
  };
}

export function personaToPayload(persona: AgentPersona): PersonaApiPayload {
  const qualificationRules = compact([
    ...compactList(persona.qualificationRules),
    ...compactList(persona.requiredQuestions),
    ...compactList(persona.discoveryFields),
    ...compactList(persona.opportunityCriteria),
  ]);
  const humanHandoffCriteria = compact([
    ...compactList(persona.sellerHandoffCriteria),
    ...compactList(persona.humanTransferTriggers),
  ]);
  const upsellRules = compact([
    ...compactList(persona.upsellRules),
    ...compactList(persona.complementaryProductRules),
    ...compactList(persona.premiumOptionRules),
    persona.insistenceLimit,
  ]);
  const restrictions = compact([
    ...compactList(persona.restrictions),
    ...compactList(persona.forbiddenSubjects),
    ...compactList(persona.forbiddenPromises),
    ...compactList(persona.nonInventableInformation),
    ...compactList(persona.humanOnlyCommercialTerms),
  ]);

  return {
    name: persona.name.trim() || null,
    role: persona.role.trim() || null,
    segment: persona.segment.trim() || null,
    language: persona.language?.trim() || 'pt-BR',
    tone: persona.tone,
    toneDetails: persona.customToneDetails?.trim() || null,
    greeting: persona.greeting.trim() || null,
    introduction: persona.introduction?.trim() || null,
    customerAddressStyle: persona.customerAddressing?.trim() || null,
    closingMessage: persona.defaultClosing?.trim() || null,
    targetAudience: persona.targetAudience.trim() || null,
    customerProfile: persona.customerType?.trim() || null,
    salesGoals: compactList(persona.salesGoals),
    qualificationRules,
    opportunityCriteria: compactList(persona.opportunityCriteria),
    humanHandoffCriteria,
    objectionHandling: {
      items: compactList(persona.objectionHandling),
      custom: compactList(persona.customObjections),
    },
    upsellRules,
    recommendationRules: compactList(persona.recommendationRules),
    escalationRules: compactList(persona.escalationRules),
    restrictions,
    examples: (persona.examples ?? []).filter((example) => example.customerMessage.trim() && example.expectedResponse.trim()),
  };
}

export function personaFromResponse(value: PersonaApiResponse): AgentPersona {
  const objections = parseObjections(value.objectionHandling);
  return {
    id: value.id,
    workspaceId: value.workspaceId,
    name: value.name ?? '',
    role: value.role ?? '',
    segment: value.segment ?? '',
    language: value.language ?? 'pt-BR',
    tone: parseTone(value.tone),
    customToneDetails: value.toneDetails ?? '',
    greeting: value.greeting ?? '',
    introduction: value.introduction ?? '',
    customerAddressing: value.customerAddressStyle ?? '',
    defaultClosing: value.closingMessage ?? '',
    targetAudience: value.targetAudience ?? '',
    salesGoals: value.salesGoals ?? [],
    customerType: value.customerProfile ?? '',
    commercialPriorities: [],
    qualificationRules: value.qualificationRules ?? [],
    requiredQuestions: [],
    discoveryFields: [],
    opportunityCriteria: value.opportunityCriteria ?? [],
    sellerHandoffCriteria: value.humanHandoffCriteria ?? [],
    objectionHandling: objections.objectionHandling,
    customObjections: objections.customObjections,
    upsellRules: value.upsellRules ?? [],
    complementaryProductRules: [],
    premiumOptionRules: [],
    insistenceLimit: '',
    recommendationRules: value.recommendationRules ?? [],
    escalationRules: value.escalationRules ?? [],
    humanTransferTriggers: value.humanHandoffCriteria ?? [],
    restrictions: value.restrictions ?? [],
    forbiddenSubjects: [],
    forbiddenPromises: [],
    nonInventableInformation: value.restrictions ?? [],
    humanOnlyCommercialTerms: [],
    examples: value.examples ?? [],
    status: value.status,
    version: value.version,
    createdAt: value.createdAt ?? undefined,
    updatedAt: value.updatedAt ?? undefined,
    activatedAt: value.activatedAt ?? undefined,
    deactivatedAt: value.deactivatedAt ?? undefined,
  };
}

function normalizeVersion(value: PersonaVersionApiResponse): PersonaVersion {
  return {
    id: value.id,
    personaId: value.personaId,
    version: value.version,
    snapshot: value.snapshot,
    changeType: value.changeType,
    createdBy: value.createdBy ?? undefined,
    createdAt: value.createdAt ?? undefined,
  };
}

export const personaService = {
  listPersonas: async (): Promise<PersonaListResult> => {
    const { data } = await api.get<PersonaListResponse>('/personas');
    return {
      items: data.items.map(personaFromResponse),
      total: data.total,
      activePersonaId: data.activePersonaId ?? undefined,
    };
  },
  createPersona: async (payload: AgentPersona): Promise<AgentPersona> => {
    const { data } = await api.post<PersonaApiResponse>('/personas', personaToPayload(payload));
    return personaFromResponse(data);
  },
  getPersona: async (personaId: string): Promise<AgentPersona> => {
    const { data } = await api.get<PersonaApiResponse>(`/personas/${personaId}`);
    return personaFromResponse(data);
  },
  updatePersona: async (personaId: string, payload: AgentPersona): Promise<AgentPersona> => {
    const { data } = await api.patch<PersonaApiResponse>(`/personas/${personaId}`, personaToPayload(payload));
    return personaFromResponse(data);
  },
  activatePersona: async (personaId: string): Promise<AgentPersona> => {
    const { data } = await api.post<PersonaApiResponse>(`/personas/${personaId}/activate`);
    return personaFromResponse(data);
  },
  deactivatePersona: async (personaId: string): Promise<AgentPersona> => {
    const { data } = await api.post<PersonaApiResponse>(`/personas/${personaId}/deactivate`);
    return personaFromResponse(data);
  },
  listPersonaVersions: async (personaId: string): Promise<PersonaVersion[]> => {
    const { data } = await api.get<PersonaVersionApiResponse[]>(`/personas/${personaId}/versions`);
    return data.map(normalizeVersion);
  },
  getPersonaVersion: async (personaId: string, version: number): Promise<PersonaVersion> => {
    const { data } = await api.get<PersonaVersionApiResponse>(`/personas/${personaId}/versions/${version}`);
    return normalizeVersion(data);
  },
  testPersona: async (payload: PersonaTestRequest): Promise<PersonaTestResponse> => {
    const { data } = await api.post<PersonaTestResponse>('/personas/test', {
      persona: personaToPayload(payload.persona),
      customerMessage: payload.customerMessage,
      optionalContext: payload.optionalContext,
    });
    return data;
  },
};
