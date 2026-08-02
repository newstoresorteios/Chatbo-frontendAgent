import { cn, formatDateTime } from '@/utils';
import type { Message } from '@/types';
import { Bot, User } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

interface ChatBubbleProps {
  message: Message;
  customerName?: string;
}

const senderConfig = {
  customer: {
    align: 'justify-start',
    bubble: 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-tl-sm',
    label: null,
  },
  agent: {
    align: 'justify-end',
    bubble: 'bg-primary-600 text-white rounded-tr-sm',
    label: 'Atendente',
  },
  ai: {
    align: 'justify-end',
    bubble: 'bg-primary-100 text-primary-900 dark:bg-primary-900/40 dark:text-primary-100 rounded-tr-sm',
    label: 'IA',
  },
};

export function ChatBubble({ message, customerName }: ChatBubbleProps) {
  const config = senderConfig[message.sender];
  const isCustomer = message.sender === 'customer';

  return (
    <div className={cn('flex gap-2', config.align)}>
      {isCustomer && customerName && (
        <Avatar name={customerName} size="sm" className="mt-1 shrink-0" />
      )}
      <div className={cn('max-w-[75%]', !isCustomer && 'flex flex-col items-end')}>
        {config.label && (
          <span className="mb-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            {message.sender === 'ai' ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
            {config.label}
          </span>
        )}
        <div className={cn('rounded-2xl px-4 py-2.5 text-sm', config.bubble)}>
          {message.content}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
          <span>{formatDateTime(message.timestamp)}</span>
          {!isCustomer && message.status === 'read' && <span>· Visualizado</span>}
        </div>
      </div>
    </div>
  );
}
