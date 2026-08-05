import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { PersonaAttachment } from '@/features/persona/types';
import { FileText, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

interface PersonaAttachmentsPanelProps {
  items: PersonaAttachment[];
  disabled?: boolean;
  uploading?: boolean;
  deletingId?: string | null;
  onUpload: (file: File) => void;
  onRemove: (attachmentId: string) => void;
}

export function PersonaAttachmentsPanel({
  items,
  disabled,
  uploading,
  deletingId,
  onUpload,
  onRemove,
}: PersonaAttachmentsPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Anexe políticas, FAQs, roteiros ou catálogos em texto. O conteúdo extraído entra no
        conhecimento do agente automático quando a persona estiver ativa (TXT, MD, CSV, JSON, PDF · até 5 MB).
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".txt,.md,.markdown,.csv,.json,.pdf,text/plain,text/markdown,text/csv,application/json,application/pdf"
          disabled={disabled || uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) onUpload(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={disabled || uploading}
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" /> Anexar arquivo
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500 dark:border-slate-700 dark:text-gray-400">
          Nenhum documento anexado ainda.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-900/60"
            >
              <div className="min-w-0 flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {item.filename}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatBytes(item.byteSize)}
                    {item.hasExtractedText ? ` · ${item.extractedChars} chars no agente` : ''}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge variant={item.status === 'processed' ? 'success' : item.status === 'failed' ? 'danger' : 'warning'}>
                      {item.status === 'processed' ? 'Pronto' : item.status === 'failed' ? 'Falhou' : 'Enviado'}
                    </Badge>
                    {item.errorMessage ? (
                      <span className="text-xs text-red-600 dark:text-red-300">{item.errorMessage}</span>
                    ) : null}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled || deletingId === item.id}
                title="Remover anexo"
                onClick={() => {
                  if (window.confirm(`Remover "${item.filename}"?`)) onRemove(item.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
