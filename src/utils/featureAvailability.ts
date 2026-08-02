import type { ChannelType } from '@/types';

/** Canais com envio/recebimento real no backend. */
export const LIVE_CHANNEL_TYPES: ChannelType[] = ['whatsapp'];

/** Integrações com API real implementada. */
export const LIVE_INTEGRATION_IDS = ['mercos'] as const;

/** Disparo de campanhas em massa via WhatsApp (backend Etapa 14). */
export const CAMPAIGNS_DISPATCH_LIVE = true;

export function isChannelLive(type: ChannelType): boolean {
  return LIVE_CHANNEL_TYPES.includes(type);
}

export function isIntegrationLive(id: string, name?: string): boolean {
  if ((LIVE_INTEGRATION_IDS as readonly string[]).includes(id)) return true;
  return name?.trim().toLowerCase() === 'mercos';
}
