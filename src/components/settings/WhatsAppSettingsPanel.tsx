import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useNotification } from '@/contexts/NotificationContext';
import { whatsappService } from '@/services/whatsapp.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Copy, MessageCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

export function WhatsAppSettingsPanel() {
  const workspace = useWorkspace();
  const { addToast } = useNotification();
  const queryClient = useQueryClient();
  const isSystemAdmin = workspace.accountType === 'system_admin';

  const { data: status, isLoading } = useQuery({
    queryKey: ['whatsapp'],
    queryFn: whatsappService.getStatus,
  });

  const [form, setForm] = useState({
    name: 'WhatsApp Comercial',
    phoneNumberId: '',
    accessToken: '',
    displayPhone: '',
  });

  const testMutation = useMutation({
    mutationFn: () => whatsappService.testConnection(),
    onSuccess: (result) => {
      addToast({
        title: result.ok ? 'WhatsApp OK' : 'Falha na conexão',
        message: result.message,
        type: result.ok ? 'success' : 'error',
      });
      queryClient.invalidateQueries({ queryKey: ['whatsapp'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Não foi possível testar o WhatsApp';
      addToast({ title: 'Erro', message: String(message), type: 'error' });
    },
  });

  const connectMutation = useMutation({
    mutationFn: () =>
      whatsappService.connect({
        name: form.name,
        phoneNumberId: form.phoneNumberId || undefined,
        accessToken: form.accessToken || undefined,
        displayPhone: form.displayPhone || undefined,
      }),
    onSuccess: () => {
      addToast({
        title: 'Canal WhatsApp salvo',
        message: 'Credenciais registradas. Teste a conexão e configure o webhook na Meta.',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['whatsapp'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Não foi possível conectar o WhatsApp';
      addToast({ title: 'Erro', message: String(message), type: 'error' });
    },
  });

  const copyWebhook = async () => {
    if (!status?.webhookUrl) return;
    await navigator.clipboard.writeText(status.webhookUrl);
    addToast({ title: 'Copiado', message: 'URL do webhook copiada', type: 'success' });
  };

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        <p className="font-medium">Dois WhatsApps no projeto — não misture</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-amber-800 dark:text-amber-200/90">
          <li>
            <strong>Vendedor IA (homologação / demo comercial):</strong> Z-API no serviço{' '}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">agent-ia-xnamai</code>.
            Webhook: <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">https://agent-ia-xnamai.onrender.com/webhook</code>.
            Conversas entram em Atendimento via bridge Supabase.
          </li>
          <li>
            <strong>Esta tela:</strong> WhatsApp oficial Meta Cloud no backend ChatBô — canal próprio,
            independente do Z-API. “Desconectado” aqui não significa que o vendedor IA está fora.
          </li>
        </ul>
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-100">
        <p className="font-medium">WhatsApp API Oficial (Meta Cloud)</p>
        <p className="mt-1 text-green-800 dark:text-green-200/90">
          Mensagens deste canal entram em <strong>Atendimento</strong> via webhook Meta. Use só se for
          operar o número oficial pela Meta — não substitui o agente Z-API da demo.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-100 p-4 dark:border-gray-800">
        {status?.connected ? (
          <>
            <CheckCircle className="h-8 w-8 shrink-0 text-green-500" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-green-600 dark:text-green-400">WhatsApp conectado</p>
              <p className="text-sm text-gray-500">
                {status.displayPhone ?? status.phoneNumberId ?? 'Número configurado'}
              </p>
            </div>
            <Badge variant="success">Ativo</Badge>
          </>
        ) : (
          <>
            <XCircle className="h-8 w-8 shrink-0 text-red-500" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-red-600">WhatsApp não conectado</p>
              <p className="text-sm text-gray-500">
                {status?.message ?? 'Configure META_* no Render ou credenciais abaixo'}
              </p>
            </div>
            <Badge variant="danger">{status?.providerStatus ?? 'Pendente'}</Badge>
          </>
        )}
        <Button variant="outline" onClick={() => testMutation.mutate()} loading={testMutation.isPending}>
          Testar conexão
        </Button>
      </div>

      {status?.webhookUrl && (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
          <p className="text-sm font-medium text-gray-900 dark:text-white">Webhook (Meta Developer)</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="break-all rounded bg-white px-2 py-1 text-xs dark:bg-gray-950">
              {status.webhookUrl}
            </code>
            <Button variant="outline" size="sm" onClick={copyWebhook}>
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Verify Token: mesmo valor de <code>META_WEBHOOK_VERIFY_TOKEN</code> no Render. Assine com{' '}
            <code>messages</code>.
          </p>
        </div>
      )}

      {isSystemAdmin && (
        <div className="space-y-4 rounded-lg border border-gray-100 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            <p className="font-medium text-gray-900 dark:text-white">Credenciais do canal</p>
          </div>
          <p className="text-sm text-gray-500">
            Deixe em branco para usar tokens globais do Render (recomendado). Preencha só se quiser
            credenciais por canal.
          </p>
          <Input
            label="Nome do canal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Phone Number ID"
            placeholder="Opcional — usa META_PHONE_NUMBER_ID do servidor"
            value={form.phoneNumberId}
            onChange={(e) => setForm({ ...form, phoneNumberId: e.target.value })}
          />
          <Input
            label="Access Token"
            type="password"
            placeholder="Opcional — usa META_ACCESS_TOKEN do servidor"
            value={form.accessToken}
            onChange={(e) => setForm({ ...form, accessToken: e.target.value })}
          />
          <Input
            label="Telefone exibido"
            placeholder="+55 11 99999-0000"
            value={form.displayPhone}
            onChange={(e) => setForm({ ...form, displayPhone: e.target.value })}
          />
          <Button
            onClick={() => connectMutation.mutate()}
            loading={connectMutation.isPending}
            disabled={!form.name.trim()}
          >
            Salvar canal WhatsApp
          </Button>
        </div>
      )}

      {!isSystemAdmin && (
        <p className="text-sm text-gray-500">
            Somente administradores globais do ChatBô podem alterar credenciais brutas do WhatsApp.
        </p>
      )}
    </div>
  );
}
