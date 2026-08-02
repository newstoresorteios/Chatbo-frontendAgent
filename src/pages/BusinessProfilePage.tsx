import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState, Loading } from '@/components/ui/EmptyState';
import { useNotification } from '@/contexts/NotificationContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import {
  BusinessAgentConfigForm,
  BusinessIdentityForm,
  BusinessOperationForm,
  useBusinessProfile,
  useSaveBusinessProfile,
  type BusinessProfileDraft,
} from '@/features/business';
import { usePermissions } from '@/hooks/usePermissions';
import { AlertCircle, Building2, Save, Settings2, Store } from 'lucide-react';
import { useEffect, useState } from 'react';

const emptyBusinessDraft: BusinessProfileDraft = {
  name: '',
  brandName: '',
  segment: '',
  website: '',
  country: '',
  currency: '',
  salesChannels: [],
  salesModel: undefined,
  whatsappSupport: false,
  ecommerce: false,
  physicalStore: false,
  consultativeSales: false,
  businessHours: '',
  primaryContact: '',
  agentDisplayName: '',
  agentMainRole: '',
  agentLanguage: '',
  agentMainChannel: '',
  agentConfigurationStatus: 'not_configured',
};

export function BusinessProfilePage() {
  const workspace = useWorkspace();
  const { can } = usePermissions();
  const { addToast } = useNotification();
  const { data, isLoading, isError, refetch } = useBusinessProfile();
  const saveMutation = useSaveBusinessProfile();
  const canManageCompany = ['owner', 'admin'].includes(workspace.role) || can('manageUsers');
  const [draft, setDraft] = useState<BusinessProfileDraft>(emptyBusinessDraft);

  useEffect(() => {
    if (data?.profile) {
      setDraft((current) => ({
        ...current,
        ...data.profile,
        name: data.profile.name || workspace.name || workspace.user?.company || '',
      }));
    } else if (workspace.name || workspace.user?.company) {
      setDraft((current) => ({ ...current, name: workspace.name || workspace.user?.company || '' }));
    }
  }, [data, workspace.name, workspace.user?.company]);

  const handleSave = () => {
    saveMutation.mutate(
      { draft, current: data?.raw },
      {
        onSuccess: () => {
          workspace.refetchWorkspace();
          addToast({
            title: 'Empresa atualizada',
            message: 'Configurações empresariais salvas no workspace.',
            type: 'success',
          });
        },
        onError: () => {
          addToast({ title: 'Erro', message: 'Não foi possível salvar os dados empresariais.', type: 'error' });
        },
      },
    );
  };

  if (isLoading) return <Loading text="Carregando dados da empresa..." />;

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Dados empresariais indisponíveis"
        description="Não foi possível carregar as configurações reais da empresa."
        action={<Button onClick={() => refetch()}>Tentar novamente</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Minha empresa</h1>
          <p className="text-gray-500 dark:text-gray-400">Empresa que controla o Assistente ChatBô neste workspace.</p>
        </div>
        <Badge variant={canManageCompany ? 'success' : 'default'}>
          {canManageCompany ? 'Edição permitida' : 'Somente leitura'}
        </Badge>
      </div>

      {!canManageCompany && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          Apenas owner/admin ou usuários com permissão equivalente podem alterar dados da empresa.
        </div>
      )}

      <Card title="Identidade" icon={Building2}>
        <BusinessIdentityForm value={draft} onChange={setDraft} disabled={!canManageCompany} />
      </Card>

      <Card title="Operação comercial" icon={Store}>
        <BusinessOperationForm value={draft} onChange={setDraft} disabled={!canManageCompany} />
      </Card>

      <Card title="Configuração do agente" icon={Settings2}>
        <BusinessAgentConfigForm value={draft} onChange={setDraft} disabled={!canManageCompany} />
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saveMutation.isPending} disabled={!canManageCompany}>
          <Save className="h-4 w-4" /> Salvar campos suportados
        </Button>
      </div>
    </div>
  );
}
