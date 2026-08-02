import type { AgentPersona } from '@/features/persona/types';
import { useMemo, useState } from 'react';

export function createEmptyPersonaDraft(): AgentPersona {
  return {
    name: '',
    role: '',
    segment: '',
    language: '',
    tone: 'professional',
    customToneDetails: '',
    greeting: '',
    introduction: '',
    customerAddressing: '',
    defaultClosing: '',
    targetAudience: '',
    salesGoals: [],
    customerType: '',
    commercialPriorities: [],
    qualificationRules: [],
    requiredQuestions: [],
    discoveryFields: [],
    opportunityCriteria: [],
    sellerHandoffCriteria: [],
    objectionHandling: [],
    customObjections: [],
    upsellRules: [],
    complementaryProductRules: [],
    premiumOptionRules: [],
    insistenceLimit: '',
    recommendationRules: [],
    escalationRules: [],
    humanTransferTriggers: [],
    restrictions: [],
    forbiddenSubjects: [],
    forbiddenPromises: [],
    nonInventableInformation: [],
    humanOnlyCommercialTerms: [],
    examples: [],
    status: 'draft',
  };
}

export function usePersonaDraft(initialDraft?: AgentPersona) {
  const fallback = useMemo(() => createEmptyPersonaDraft(), []);
  const [draft, setDraft] = useState<AgentPersona>(initialDraft ?? fallback);

  return { draft, setDraft };
}
