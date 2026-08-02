import type { ChannelType } from '@/types';
import {
  Facebook,
  Globe,
  Instagram,
  Mail,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const channelConfig: Record<
  ChannelType,
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  whatsapp: {
    label: 'WhatsApp',
    icon: MessageCircle,
    color: 'text-green-600',
    bg: 'bg-green-100 dark:bg-green-900/30',
  },
  instagram: {
    label: 'Instagram',
    icon: Instagram,
    color: 'text-pink-600',
    bg: 'bg-pink-100 dark:bg-pink-900/30',
  },
  facebook: {
    label: 'Facebook',
    icon: Facebook,
    color: 'text-blue-600',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  telegram: {
    label: 'Telegram',
    icon: Send,
    color: 'text-sky-600',
    bg: 'bg-sky-100 dark:bg-sky-900/30',
  },
  webchat: {
    label: 'WebChat',
    icon: Globe,
    color: 'text-violet-600',
    bg: 'bg-violet-100 dark:bg-violet-900/30',
  },
  sms: {
    label: 'SMS',
    icon: Phone,
    color: 'text-amber-600',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  email: {
    label: 'E-mail',
    icon: Mail,
    color: 'text-gray-600',
    bg: 'bg-gray-100 dark:bg-gray-800',
  },
};

export function getChannelLabel(type: ChannelType): string {
  return channelConfig[type]?.label ?? type;
}
