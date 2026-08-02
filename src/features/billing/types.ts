export type PricingMode = 'fixed' | 'contact_sales';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'suspended' | 'canceled' | 'expired' | 'legacy_unassigned';

export interface Plan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
  billingInterval: 'monthly' | 'yearly';
  priceCents: number;
  pricingMode: PricingMode;
  currency: string;
  trialDays: number;
  sortOrder: number;
  isPublic: boolean;
  features?: Record<string, boolean>;
  limits?: Record<string, number | null>;
}

export interface Subscription {
  id: string;
  workspaceId: string;
  status: SubscriptionStatus;
  effectiveStatus: SubscriptionStatus;
  planCode: string;
  planName: string;
  billingInterval: string;
  currency: string;
  unitAmountCents: number;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  currentPeriodStartedAt: string | null;
  currentPeriodEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface BillingOverview {
  subscription: Subscription | null;
  subscriptionState: SubscriptionStatus;
  plan: Plan | null;
  entitlements: {
    features: Record<string, boolean>;
    limits: Record<string, number | null>;
    usage: { values: Record<string, number>; periodKey: string };
  };
}
