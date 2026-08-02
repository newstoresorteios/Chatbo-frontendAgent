import type { ChannelType } from '@/types';
import { CHANNEL_LABELS } from '@/features/dashboard/constants';

export function buildChannelVolume(
  channels: { type: ChannelType; name: string; messagesToday: number }[] | undefined,
  conversations: { channel: ChannelType }[] | undefined,
): { name: string; value: number; type: ChannelType }[] {
  const fromChannels = (channels ?? [])
    .filter((c) => c.messagesToday > 0)
    .map((c) => ({ name: c.name, count: c.messagesToday, type: c.type }));

  const source = fromChannels.length
    ? fromChannels
    : Object.entries(
        (conversations ?? []).reduce<Record<string, number>>((acc, c) => {
          acc[c.channel] = (acc[c.channel] ?? 0) + 1;
          return acc;
        }, {}),
      ).map(([type, count]) => ({
        name: CHANNEL_LABELS[type as ChannelType] ?? type,
        count,
        type: type as ChannelType,
      }));

  const total = source.reduce((sum, item) => sum + item.count, 0);
  if (!total) return [];

  return source.map((item) => ({
    name: item.name,
    type: item.type,
    value: Math.max(1, Math.round((item.count / total) * 100)),
  }));
}
