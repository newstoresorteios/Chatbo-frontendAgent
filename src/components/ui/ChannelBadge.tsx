import { cn } from '@/utils';
import { channelConfig, getChannelLabel } from '@/utils/channels';
import type { ChannelType } from '@/types';

interface ChannelBadgeProps {
  channel: ChannelType;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function ChannelBadge({ channel, showLabel = true, size = 'sm', className }: ChannelBadgeProps) {
  const config = channelConfig[channel];
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        config.bg,
        config.color,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className,
      )}
    >
      <Icon className={iconSize} />
      {showLabel && getChannelLabel(channel)}
    </span>
  );
}
