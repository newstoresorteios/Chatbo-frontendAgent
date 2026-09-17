import { Button } from '@/components/ui/Button';
import { useNotification } from '@/contexts/NotificationContext';
import { cn } from '@/utils';
import { Paperclip, Send, Smile, X } from 'lucide-react';
import { useRef, useState, type KeyboardEvent } from 'react';

const EMOJIS = ['😀', '😊', '👍', '❤️', '🎉', '🔥', '✅', '🙏', '💬', '📎', '🚀', '⭐'];

interface MessageInputProps {
  onSend: (message: string) => void;
  onSendFile?: (file: File, caption: string) => boolean | void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  onSendFile,
  disabled,
  placeholder = 'Digite sua mensagem...',
}: MessageInputProps) {
  const [value, setValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { addToast } = useNotification();

  const handleSend = () => {
    const trimmed = value.trim();
    if ((!trimmed && !selectedFile) || disabled) return;
    if (selectedFile && onSendFile) {
      if (onSendFile(selectedFile, trimmed) === false) return;
    } else onSend(trimmed);
    setSelectedFile(null);
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
      if (!onSendFile) {
        addToast({ title: 'Anexos indisponíveis', message: 'Esta tela ainda não envia arquivos.', type: 'warning' });
      } else if (file.size > 16 * 1024 * 1024) {
        addToast({ title: 'Arquivo grande', message: 'Limite de 16 MB por anexo.', type: 'warning' });
      } else {
        setSelectedFile(file);
      }
    }
    e.target.value = '';
  };

  const insertEmoji = (emoji: string) => {
    setValue((v) => v + emoji);
    setShowEmoji(false);
  };

  return (
    <div className="relative border-t border-gray-200 bg-white px-3 py-3 dark:border-gray-800 dark:bg-gray-950 sm:px-4">
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
      <input ref={fileRef} type="file" className="hidden" onChange={handleFile}
        accept="image/jpeg,image/png,image/webp,audio/aac,audio/mp4,audio/mpeg,audio/ogg,audio/amr,application/pdf,text/plain,.docx" />
      {selectedFile && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-primary-50 px-3 py-2 text-xs text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
          <span className="truncate">{selectedFile.name} · {Math.round(selectedFile.size / 1024)} KB</span>
          <button type="button" onClick={() => setSelectedFile(null)} aria-label="Remover anexo"><X className="h-4 w-4" /></button>
        </div>
      )}
      <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1.5 shadow-sm transition focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-500/10 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex gap-0.5">
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
            'max-h-32 min-h-[40px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm focus:outline-none focus:ring-0 dark:text-gray-100',
            disabled && 'opacity-50',
          )}
        />
        <Button onClick={handleSend} disabled={disabled || (!value.trim() && !selectedFile)} size="icon" title="Enviar">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
