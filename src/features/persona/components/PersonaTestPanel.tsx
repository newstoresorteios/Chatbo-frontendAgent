import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextareaField } from '@/features/persona/components/PersonaFormPrimitives';
import type { AgentPersona } from '@/features/persona/types';
import { Send } from 'lucide-react';
import { useState } from 'react';

export function PersonaTestPanel({
  persona,
  disabled,
  isLoading,
  response,
  error,
  onTest,
}: {
  persona: AgentPersona;
  disabled?: boolean;
  isLoading?: boolean;
  response?: string;
  error?: string;
  onTest?: (message: string) => void;
}) {
  const [message, setMessage] = useState('');

  return (
    <Card title="Teste visual da persona" subtitle="O rascunho nao e enviado ao agente ativo da empresa.">
      <div className="space-y-4">
        <TextareaField
          label="Mensagem simulada do cliente"
          value={message}
          onChange={setMessage}
          placeholder="Digite uma pergunta ou objecao para testar esta configuracao temporaria."
          disabled={disabled || isLoading}
        />
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}
        {response && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200">
            {response}
          </div>
        )}
        <Button type="button" disabled={disabled || !message.trim()} loading={isLoading} onClick={() => onTest?.(message.trim())}>
          <Send className="h-4 w-4" /> Testar persona
        </Button>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Persona em rascunho: {persona.name || 'Nao configurado'}
        </p>
      </div>
    </Card>
  );
}
