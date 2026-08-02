export interface BusinessProfile {
  name: string;
  brandName?: string;
  segment?: string;
  website?: string;
  country?: string;
  currency?: string;
  salesChannels?: string[];
  salesModel?: 'b2b' | 'b2c' | 'mixed';
  whatsappSupport?: boolean;
  ecommerce?: boolean;
  physicalStore?: boolean;
  consultativeSales?: boolean;
  businessHours?: string;
  primaryContact?: string;
  agentDisplayName?: string;
  agentMainRole?: string;
  agentLanguage?: string;
  agentMainChannel?: string;
  agentConfigurationStatus?: 'not_configured' | 'draft' | 'configured';
}

export type OnboardingStep =
  | 'empresa'
  | 'operacao'
  | 'catalogo'
  | 'canais'
  | 'persona'
  | 'test'
  | 'ativacao';
