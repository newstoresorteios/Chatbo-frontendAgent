import type { BusinessProfile } from '@/features/onboarding/types';

export type { BusinessProfile };

export type BusinessProfileDraft = BusinessProfile;

export interface BusinessPersistence {
  canPersist: boolean;
  supportedFields: Array<keyof BusinessProfileDraft>;
  unavailableMessage?: string;
}
