import type { ChannelType } from '@/types';

export const CHART = {
  blue: '#2563EB',
  deepBlue: '#1D4ED8',
  red: '#EF4444',
  green: '#16A34A',
  amber: '#F59E0B',
  slate: '#64748B',
};

export const PIE_COLORS = ['#2563EB', '#EF4444', '#1D4ED8', '#16A34A', '#F59E0B', '#64748B'];

export const CHANNEL_LABELS: Record<ChannelType, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  webchat: 'WebChat',
  telegram: 'Telegram',
  facebook: 'Facebook',
  sms: 'SMS',
  email: 'E-mail',
};

export const FUTURE_NAV_ITEMS = [
  {
    to: '/persona',
    label: 'Persona do agente',
    status: 'future',
  },
] as const;
