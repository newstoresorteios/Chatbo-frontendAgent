export type PersonaStatus = 'draft' | 'active' | 'inactive';

export interface PersonaExample {
  id?: string;
  customerMessage: string;
  expectedResponse: string;
}

export interface AgentPersona {
  id?: string;
  workspaceId?: string;
  name: string;
  role: string;
  segment: string;
  language?: string;
  tone: PersonaTone;
  customToneDetails?: string;
  greeting: string;
  introduction?: string;
  customerAddressing?: string;
  defaultClosing?: string;
  targetAudience: string;
  salesGoals: string[];
  customerType?: string;
  commercialPriorities?: string[];
  qualificationRules: string[];
  requiredQuestions?: string[];
  discoveryFields?: string[];
  opportunityCriteria?: string[];
  sellerHandoffCriteria?: string[];
  objectionHandling: string[];
  customObjections?: string[];
  upsellRules: string[];
  complementaryProductRules?: string[];
  premiumOptionRules?: string[];
  insistenceLimit?: string;
  recommendationRules?: string[];
  escalationRules: string[];
  humanTransferTriggers?: string[];
  restrictions: string[];
  forbiddenSubjects?: string[];
  forbiddenPromises?: string[];
  nonInventableInformation?: string[];
  humanOnlyCommercialTerms?: string[];
  examples?: PersonaExample[];
  status: PersonaStatus;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  activatedAt?: string;
  deactivatedAt?: string;
}

export type PersonaChangeType = 'created' | 'updated' | 'activated' | 'deactivated';

export interface PersonaVersionSnapshot {
  id?: string;
  workspaceId?: string;
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
  objectionHandling?: {
    items?: string[];
    custom?: string[];
  };
  upsellRules?: string[];
  recommendationRules?: string[];
  escalationRules?: string[];
  restrictions?: string[];
  examples?: PersonaExample[];
  status?: PersonaStatus;
  version?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  activatedAt?: string | null;
  deactivatedAt?: string | null;
}

export interface PersonaVersion {
  id: string;
  personaId: string;
  version: number;
  snapshot: PersonaVersionSnapshot;
  changeType: PersonaChangeType;
  createdBy?: string;
  createdAt?: string;
}

export type PersonaTone =
  | 'professional'
  | 'consultative'
  | 'objective'
  | 'friendly'
  | 'sophisticated'
  | 'technical'
  | 'informal'
  | 'custom';
