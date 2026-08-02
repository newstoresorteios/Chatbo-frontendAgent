import { settingsService, type CompanySettings } from '@/services/settings.service';
import type { BusinessProfileDraft, BusinessPersistence } from '@/features/business/types';

export const businessPersistence: BusinessPersistence = {
  canPersist: true,
  supportedFields: [
    'name',
    'brandName',
    'segment',
    'website',
    'country',
    'currency',
    'salesModel',
    'salesChannels',
    'businessHours',
    'primaryContact',
    'agentDisplayName',
    'agentMainRole',
    'agentLanguage',
    'agentMainChannel',
  ],
};

export function businessFromCompanySettings(settings: CompanySettings): BusinessProfileDraft {
  return {
    name: settings.name ?? '',
    brandName: settings.brandName ?? '',
    segment: settings.segment ?? '',
    website: settings.website ?? '',
    country: settings.country ?? '',
    currency: settings.currency ?? '',
    salesModel: settings.salesModel,
    salesChannels: settings.salesChannels ?? [],
    businessHours: settings.businessHours ?? '',
    primaryContact: settings.primaryContact ?? settings.email ?? '',
    agentDisplayName: settings.agentDisplayName ?? '',
    agentMainRole: settings.agentRole ?? '',
    agentLanguage: settings.agentLanguage ?? '',
    agentMainChannel: settings.agentPrimaryChannel ?? '',
    agentConfigurationStatus: settings.agentDisplayName || settings.agentRole ? 'configured' : 'not_configured',
  };
}

export function companySettingsFromBusinessDraft(
  draft: BusinessProfileDraft,
  current?: CompanySettings,
): CompanySettings {
  return {
    name: draft.name,
    brandName: draft.brandName ?? current?.brandName,
    cnpj: current?.cnpj,
    email: draft.primaryContact ?? current?.email,
    phone: current?.phone,
    segment: draft.segment ?? current?.segment,
    website: draft.website ?? current?.website,
    country: draft.country ?? current?.country,
    currency: draft.currency ?? current?.currency,
    salesModel: draft.salesModel ?? current?.salesModel,
    salesChannels: draft.salesChannels ?? current?.salesChannels,
    businessHours: draft.businessHours ?? current?.businessHours,
    primaryContact: draft.primaryContact ?? current?.primaryContact,
    agentDisplayName: draft.agentDisplayName ?? current?.agentDisplayName,
    agentRole: draft.agentMainRole ?? current?.agentRole,
    agentLanguage: draft.agentLanguage ?? current?.agentLanguage,
    agentPrimaryChannel: draft.agentMainChannel ?? current?.agentPrimaryChannel,
  };
}

export type CompanyStepPayload = Partial<Pick<
  CompanySettings,
  'name' | 'brandName' | 'segment' | 'website' | 'country' | 'currency' | 'salesModel'
>>;

function nonEmptyString(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function toCompanyStepPayload(draft: BusinessProfileDraft): CompanyStepPayload {
  const payload: CompanyStepPayload = {};
  const name = nonEmptyString(draft.name);
  const brandName = nonEmptyString(draft.brandName);
  const segment = nonEmptyString(draft.segment);
  const website = nonEmptyString(draft.website);
  const country = nonEmptyString(draft.country);
  const currency = nonEmptyString(draft.currency);

  if (name) payload.name = name;
  if (brandName) payload.brandName = brandName;
  if (segment) payload.segment = segment;
  if (website) payload.website = website;
  if (country) payload.country = country;
  if (currency) payload.currency = currency;
  if (draft.salesModel) payload.salesModel = draft.salesModel;

  return payload;
}

export const businessService = {
  getProfile: async (): Promise<{ profile: BusinessProfileDraft; raw: CompanySettings }> => {
    const raw = await settingsService.getCompany();
    return { profile: businessFromCompanySettings(raw), raw };
  },

  saveProfile: async (
    draft: BusinessProfileDraft,
    current?: CompanySettings,
  ): Promise<{ profile: BusinessProfileDraft; raw: CompanySettings }> => {
    const raw = await settingsService.saveCompany(companySettingsFromBusinessDraft(draft, current));
    return { profile: businessFromCompanySettings(raw), raw };
  },

  saveCompanyStep: async (draft: BusinessProfileDraft): Promise<{ profile: BusinessProfileDraft; raw: CompanySettings }> => {
    const raw = await settingsService.saveCompany(toCompanyStepPayload(draft));
    return { profile: businessFromCompanySettings(raw), raw };
  },
};
