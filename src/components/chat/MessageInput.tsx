import { Button } from '@/components/ui/Button';
import { useNotification } from '@/contexts/NotificationContext';
import { cn } from '@/utils';
import { Paperclip, Send, Smile, X } from 'lucide-react';
import { useRef, useState, type KeyboardEvent } from 'react';

const EMOJIS = ['😀', '😊', '👍', '❤️', '🎉', '🔥', '✅', '🙏', '💬', '📎', '🚀', '⭐'];

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled,
  placeholder = 'Digite sua mensagem...',
}: MessageInputProps) {
  const [value, setValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { addToast } = useNotification();

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    setShowEmoji(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addToast({
        title: 'Arquivo anexado',
        message: `${file.name} (${Math.round(file.size / 1024)} KB) pronto para envio`,
        type: 'success',
      });
      setValue((v) => (v ? `${v}\n📎 ${file.name}` : `📎 ${file.name}`));
    }
    e.target.value = '';
  };

  const insertEmoji = (emoji: string) => {
    setValue((v) => v + emoji);
    setShowEmoji(false);
  };

  return (
    <div className="relative border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      {showEmoji && (
        <div className="absolute bottom-full left-4 mb-2 flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => insertEmoji(e)}
              className="rounded-lg p-1.5 text-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {e}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowEmoji(false)}
            className="ml-auto rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            disabled={disabled}
            onClick={() => fileRef.current?.click()}
            title="Anexar arquivo"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            variant={showEmoji ? 'primary' : 'ghost'}
            size="icon"
            type="button"
            disabled={disabled}
            onClick={() => setShowEmoji(!showEmoji)}
            title="Emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'max-h-32 min-h-[40px] flex-1 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
            disabled && 'opacity-50',
          )}
        />
        <Button onClick={handleSend} disabled={disabled || !value.trim()} size="icon" title="Enviar">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
