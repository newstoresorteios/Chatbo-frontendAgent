import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { cn, formatRelativeTime } from '@/utils';
import { isHandoffWaiting } from '@/utils/conversationAlerts';
import type { Conversation } from '@/types';

interface ConversationCardProps {
  conversation: Conversation;
  active?: boolean;
  pinned?: boolean;
  animateWaiting?: boolean;
  onClick: () => void;
  onPrefetch?: () => void;
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

export function ConversationCard({ conversation, active, pinned, animateWaiting = true, onClick, onPrefetch }: ConversationCardProps) {
  const status = statusVariant[conversation.status] ? conversation.status : 'active';
  const handoffWaiting = isHandoffWaiting(conversation);
  return (
    <button
      onClick={onClick}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      className={cn(
        'group mx-2 my-1 flex min-h-[72px] w-[calc(100%-1rem)] items-start gap-3 rounded-xl border p-3 text-left transition-all duration-150 md:my-1.5',
        active
          ? 'border-primary-200 bg-primary-50 shadow-sm ring-1 ring-primary-100 dark:border-primary-800 dark:bg-primary-950/40 dark:ring-primary-900'
          : 'border-transparent bg-transparent hover:border-gray-200 hover:bg-white hover:shadow-sm dark:hover:border-gray-700 dark:hover:bg-gray-900',
        pinned && !active && 'border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20',
        handoffWaiting && !active && 'border-red-200 bg-red-50/70 dark:border-red-900 dark:bg-red-950/20',
        handoffWaiting && !active && animateWaiting && 'animate-handoff-card',
        handoffWaiting && active && 'border-red-300 ring-red-100 dark:border-red-800 dark:ring-red-950',
      )}
    >
      <Avatar name={conversation.customerName || 'Cliente'} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('truncate text-sm font-semibold text-gray-900 dark:text-gray-100', conversation.unreadCount > 0 && 'font-bold')}>
            {conversation.customerName || 'Cliente'}
          </span>
          <span className="shrink-0 text-xs text-gray-400">
            {formatRelativeTime(conversation.lastMessageAt)}
          </span>
        </div>
        <p className={cn('mt-1 truncate text-sm text-gray-500 dark:text-gray-400', conversation.unreadCount > 0 && 'font-medium text-gray-700 dark:text-gray-200')}>
          {conversation.lastMessage || 'Sem mensagens ainda'}
        </p>
        <div className="mt-2 flex min-w-0 items-center gap-1.5 md:mt-2.5">
          <Badge variant={handoffWaiting ? 'danger' : statusVariant[status]}>
            {handoffWaiting ? 'Aguardando humano' : statusLabel[status]}
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
