import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { cn, formatRelativeTime } from '@/utils';
import type { Conversation } from '@/types';

interface ConversationCardProps {
  conversation: Conversation;
  active?: boolean;
  pinned?: boolean;
  onClick: () => void;
}

const statusVariant = {
  active: 'success' as const,
  waiting: 'warning' as const,
  closed: 'default' as const,
};

const statusLabel = {
  active: 'Ativa',
  waiting: 'Aguardando',
  closed: 'Encerrada',
};

export function ConversationCard({ conversation, active, pinned, onClick }: ConversationCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 border-b border-gray-100 p-4 text-left transition-colors dark:border-gray-800',
        active
          ? 'bg-primary-50 dark:bg-primary-900/20'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
        pinned && !active && 'border-l-2 border-l-amber-400 bg-amber-50/50 dark:bg-amber-900/10',
      )}
    >
      <Avatar name={conversation.customerName} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium text-gray-900 dark:text-gray-100">
            {conversation.customerName}
          </span>
          <span className="shrink-0 text-xs text-gray-400">
            {formatRelativeTime(conversation.lastMessageAt)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
          {conversation.lastMessage}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant={statusVariant[conversation.status]}>
            {statusLabel[conversation.status]}
          </Badge>
          <span className="text-xs text-gray-400">{conversation.department}</span>
          {conversation.assignedName && (
            <span className="truncate text-xs text-gray-400">· {conversation.assignedName}</span>
          )}
          <ChannelBadge channel={conversation.channel} showLabel={false} />
          {conversation.unreadCount > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs font-medium text-white">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
