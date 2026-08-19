import { PERSONA_TRANSFER_TRIGGERS } from '@/features/persona/types';
import { api } from '@/services/api';
import type {
  AgentPersona,
  PersonaAttachment,
  PersonaExample,
  PersonaStatus,
  PersonaTone,
  PersonaVersion,
  PersonaVersionSnapshot,
} from '@/features/persona/types';

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
  attachments: (workspaceId: string, personaId: string) => ['persona-attachments', workspaceId, personaId] as const,
};

function compact(values: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of values) {
    const text = item?.trim() ?? '';
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(text);
  }
  return result;
}

function compactList(values: string[] | undefined): string[] {
  return compact(values ?? []);
}

function mergeUnique(...groups: Array<string[] | undefined | string | null>): string[] {
  return compact(groups.flatMap((group) => (Array.isArray(group) ? group : [group])));
}

function normalizeExamples(value: unknown): PersonaExample[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw) => {
      const row = (raw ?? {}) as Record<string, unknown>;
      return {
        customerMessage: String(row.customerMessage ?? row.customer_message ?? '').trim(),
        expectedResponse: String(row.expectedResponse ?? row.expected_response ?? '').trim(),
      };
    })
    .filter((example) => example.customerMessage && example.expectedResponse);
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
  const qualificationRules = mergeUnique(
    persona.qualificationRules,
    persona.requiredQuestions,
    persona.discoveryFields,
    persona.opportunityCriteria,
  );
  const humanHandoffCriteria = mergeUnique(
    persona.sellerHandoffCriteria,
    persona.humanTransferTriggers,
  );
  const upsellRules = mergeUnique(
    persona.upsellRules,
    persona.complementaryProductRules,
    persona.premiumOptionRules,
    persona.insistenceLimit,
  );
  const restrictions = mergeUnique(
    persona.restrictions,
    persona.forbiddenSubjects,
    persona.forbiddenPromises,
    persona.nonInventableInformation,
    persona.humanOnlyCommercialTerms,
  );

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
    examples: normalizeExamples(persona.examples),
  };
}

export function personaFromResponse(value: PersonaApiResponse): AgentPersona {
  const objections = parseObjections(value.objectionHandling);
  const triggerSet = new Set<string>(PERSONA_TRANSFER_TRIGGERS);
  const handoff = compactList(value.humanHandoffCriteria);
  const restrictions = compactList(value.restrictions);
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
    salesGoals: compactList(value.salesGoals),
    customerType: value.customerProfile ?? '',
    commercialPriorities: [],
    qualificationRules: compactList(value.qualificationRules),
    requiredQuestions: [],
    discoveryFields: [],
    opportunityCriteria: compactList(value.opportunityCriteria),
    sellerHandoffCriteria: handoff.filter((item) => !triggerSet.has(item)),
    objectionHandling: objections.objectionHandling,
    customObjections: objections.customObjections,
    upsellRules: compactList(value.upsellRules),
    complementaryProductRules: [],
    premiumOptionRules: [],
    insistenceLimit: '',
    recommendationRules: compactList(value.recommendationRules),
    escalationRules: compactList(value.escalationRules),
    humanTransferTriggers: handoff.filter((item) => triggerSet.has(item)),
    restrictions,
    forbiddenSubjects: [],
    forbiddenPromises: [],
    nonInventableInformation: restrictions,
    humanOnlyCommercialTerms: [],
    examples: normalizeExamples(value.examples),
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
  listAttachments: async (personaId: string): Promise<PersonaAttachment[]> => {
    const { data } = await api.get<{ items: PersonaAttachment[]; total: number }>(
      `/personas/${personaId}/attachments`,
    );
    return data.items ?? [];
  },
  uploadAttachment: async (personaId: string, file: File): Promise<PersonaAttachment> => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<PersonaAttachment>(
      `/personas/${personaId}/attachments`,
      form,
      {
        headers: { 'Content-Type': undefined as unknown as string },
      },
    );
    return data;
  },
  deleteAttachment: async (personaId: string, attachmentId: string): Promise<void> => {
    await api.delete(`/personas/${personaId}/attachments/${attachmentId}`);
  },
};
