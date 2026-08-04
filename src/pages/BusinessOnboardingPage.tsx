import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState, Loading } from '@/components/ui/EmptyState';
import { useNotification } from '@/contexts/NotificationContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import {
  BusinessIdentityForm,
  BusinessOperationForm,
  useBusinessProfile,
  useSaveBusinessCompanyStep,
  type BusinessProfileDraft,
} from '@/features/business';
import type { OnboardingStep } from '@/features/onboarding/types';
import {
  onboardingKeys,
  onboardingService,
  type MissingRequirement,
  type WorkspaceChannel,
} from '@/services/onboarding.service';
import { authService, USER_KEY } from '@/services/api';
import { workspaceKeys } from '@/services/workspace.service';
import { extractApiErrorMessage } from '@/utils/apiErrors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/** Fluxo mínimo do onboarding — persona/teste ficam em Configurações. */
const steps: Array<{ id: OnboardingStep; label: string }> = [
  { id: 'empresa', label: 'Empresa' },
  { id: 'operacao', label: 'Operação' },
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'canais', label: 'Canais' },
  { id: 'ativacao', label: 'Ativação' },
];

const initialBusiness: BusinessProfileDraft = {
  name: '',
  salesChannels: [],
  salesModel: undefined,
  agentConfigurationStatus: 'not_configured',
};

const editableRoles = new Set(['owner', 'admin']);
const viewRoles = new Set(['owner', 'admin', 'supervisor']);

const requirementLabels: Record<MissingRequirement, string> = {
  companyConfigured: 'Empresa configurada',
  operationConfigured: 'Operação configurada',
  catalogAvailable: 'Catálogo disponível (opcional)',
  catalogScope: 'Origem do catálogo',
  catalogProductCount: 'Produtos do catálogo',
  channelConfigured: 'Canal configurado',
  personaCreated: 'Persona criada',
  personaActive: 'Persona ativa',
  testCompleted: 'Teste concluído',
  readyForActivation: 'Pronto para ativação',
};

function normalizeStep(step?: string | null): OnboardingStep {
  // Passos antigos (persona/teste) não fazem mais parte do fluxo obrigatório.
  if (step === 'persona' || step === 'teste' || step === 'test') return 'ativacao';
  if (steps.some((item) => item.id === step)) return step as OnboardingStep;
  return 'empresa';
}

interface ValidationDetail {
  loc?: unknown;
}

interface ApiErrorWithValidation {
  response?: {
    data?: {
      detail?: unknown;
    };
  };
}

function errorMessage(error: unknown, fallback: string) {
  const detail = (error as ApiErrorWithValidation).response?.data?.detail;
  if (
    Array.isArray(detail) &&
    detail.some((item): item is ValidationDetail => {
      if (!item || typeof item !== 'object') return false;
      const loc = (item as ValidationDetail).loc;
      return Array.isArray(loc) && loc.includes('businessHours');
    })
  ) {
    return 'Os horários de atendimento estão em um formato inválido.';
  }
  return extractApiErrorMessage(error, fallback);
}

export function BusinessOnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useNotification();
  const workspace = useWorkspace();
  const workspaceId = workspace.id;
  const canEdit = editableRoles.has(workspace.role);
  const canView = viewRoles.has(workspace.role);
  const {
    data: businessData,
    isLoading: businessLoading,
    isError: businessError,
    refetch: refetchBusiness,
  } = useBusinessProfile();
  const onboardingQuery = useQuery({
    queryKey: onboardingKeys.current(workspaceId),
    queryFn: () => onboardingService.getCurrent(workspaceId),
    enabled: workspaceId !== 'legacy',
  });
  const channelsQuery = useQuery({
    queryKey: onboardingKeys.channels(workspaceId),
    queryFn: () => onboardingService.listChannels(workspaceId),
    enabled: workspaceId !== 'legacy' && canView,
  });
  const saveBusiness = useSaveBusinessCompanyStep();
  const [businessDraft, setBusinessDraft] = useState<BusinessProfileDraft>(initialBusiness);
  const [activeStep, setActiveStep] = useState<OnboardingStep>('empresa');
  const onboarding = onboardingQuery.data;
  const currentIndex = steps.findIndex((step) => step.id === activeStep);
  const isBusy = saveBusiness.isPending || onboardingQuery.isFetching || channelsQuery.isFetching;

  useEffect(() => {
    if (businessData?.profile) {
      setBusinessDraft((current) => ({ ...current, ...businessData.profile }));
    }
  }, [businessData?.profile]);

  useEffect(() => {
    if (onboarding?.currentStep) setActiveStep(normalizeStep(onboarding.currentStep));
  }, [onboarding?.currentStep]);

  const invalidateOnboarding = async () => {
    await queryClient.invalidateQueries({ queryKey: onboardingKeys.current(workspaceId) });
    await queryClient.invalidateQueries({ queryKey: workspaceKeys.current() });
  };

  const persistStep = async (step: OnboardingStep) => {
    if (!canEdit) return;
    await onboardingService.update(
      workspaceId,
      step,
      onboarding?.status === 'pending' ? 'in_progress' : undefined,
    );
    await invalidateOnboarding();
  };

  const saveBusinessStep = async () => {
    await saveBusiness.mutateAsync({ draft: businessDraft });
    await invalidateOnboarding();
  };

  const channelMutation = useMutation({
    mutationFn: (type: WorkspaceChannel['channelType']) =>
      onboardingService.saveChannel(workspaceId, type),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: onboardingKeys.channels(workspaceId) });
      await invalidateOnboarding();
    },
  });

  const activationMutation = useMutation({
    mutationFn: () => onboardingService.activate(workspaceId),
    onSuccess: async () => {
      await invalidateOnboarding();
      await queryClient.invalidateQueries({ queryKey: workspaceKeys.current() });
      try {
        const { data } = await authService.me();
        localStorage.setItem(USER_KEY, JSON.stringify(data));
      } catch {
        /* workspace query remains the source for the redirect */
      }
      addToast({
        title: 'Onboarding concluído',
        message: 'ChatBô foi ativado. Configure a Persona depois em Configurações, se quiser.',
        type: 'success',
      });
      navigate('/dashboard', { replace: true });
    },
    onError: (error: unknown) => {
      addToast({
        title: 'Ativação bloqueada',
        message: errorMessage(error, 'O onboarding ainda possui requisitos pendentes.'),
        type: 'error',
      });
    },
  });

  const goTo = async (index: number) => {
    const next = steps[index];
    if (!next || isBusy) return;
    try {
      if (index > currentIndex) {
        if (activeStep === 'empresa') await saveBusinessStep();
        if (activeStep === 'operacao') await saveBusinessStep();
        if (activeStep === 'canais' && !onboarding?.requirements.channelConfigured) {
          addToast({
            title: 'Canal não configurado',
            message: 'Selecione e salve pelo menos um canal.',
            type: 'error',
          });
          return;
        }
        if (canEdit) await persistStep(next.id);
      }
      setActiveStep(next.id);
    } catch (error: unknown) {
      addToast({
        title: 'Não foi possível salvar',
        message: errorMessage(error, 'Tente novamente em instantes.'),
        type: 'error',
      });
    }
  };

  if (!canView) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Acesso restrito"
        description="Seller e member não podem configurar o onboarding empresarial."
      />
    );
  }
  if (businessLoading || onboardingQuery.isLoading || workspace.isLoading) {
    return <Loading text="Carregando onboarding..." />;
  }
  if (businessError || onboardingQuery.isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Não foi possível carregar o onboarding"
        description="Verifique a sessão e o workspace ativo."
        action={
          <Button
            onClick={() => {
              void refetchBusiness();
              void onboardingQuery.refetch();
            }}
          >
            Tentar novamente
          </Button>
        }
      />
    );
  }
  if (!onboarding) return null;

  const req = onboarding.requirements;
  const checklist: Array<[MissingRequirement, boolean]> = [
    ['companyConfigured', req.companyConfigured],
    ['operationConfigured', req.operationConfigured],
    ['channelConfigured', req.channelConfigured],
  ];
  const completedSteps = onboarding.completedSteps.map(normalizeStep);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Onboarding empresarial</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Configure o essencial da empresa e ative o ChatBô. Persona e testes ficam em Configurações.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                void goTo(index);
              }}
              disabled={isBusy}
              className={`min-h-10 rounded-lg border px-4 text-sm font-semibold ${
                activeStep === step.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'
              }`}
            >
              {index + 1}. {step.label}
              {completedSteps.includes(step.id) ? ' ✓' : ''}
            </button>
          ))}
        </div>
      </div>

      {activeStep === 'empresa' && (
        <Card title="Empresa">
          <BusinessIdentityForm
            value={businessDraft}
            onChange={setBusinessDraft}
            disabled={!canEdit || isBusy}
          />
          <p className="mt-4 text-xs text-gray-500">
            Obrigatórios: nome ou marca, país, moeda e segmento.
          </p>
        </Card>
      )}

      {activeStep === 'operacao' && (
        <Card title="Operação">
          <BusinessOperationForm
            value={businessDraft}
            onChange={setBusinessDraft}
            disabled={!canEdit || isBusy}
          />
          <p className="mt-4 text-xs text-gray-500">
            Obrigatórios: modelo de vendas, canal comercial, horário e contato principal.
          </p>
        </Card>
      )}

      {activeStep === 'catalogo' && (
        <Card title="Catálogo">
          {req.catalogAvailable ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {req.catalogProductCount ?? 0} produto(s) reconhecido(s).
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Nenhum produto sincronizado ainda. Isso é opcional — você pode avançar e conectar o
                catálogo depois em Configurações → Atualização de catálogo.
              </p>
              <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200">
                O ChatBô funciona sem catálogo; com produtos sincronizados ele consegue orçar e
                recomendar melhor.
              </p>
            </div>
          )}
          {req.catalogScope === 'legacy_global' && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Catálogo atual reconhecido em modo legado. O isolamento por empresa será implementado
              em uma etapa futura.
            </p>
          )}
        </Card>
      )}

      {activeStep === 'canais' && (
        <Card title="Canais">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant={
                channelsQuery.data?.some((c) => c.channelType === 'whatsapp')
                  ? 'secondary'
                  : 'outline'
              }
              disabled={!canEdit || channelMutation.isPending}
              loading={channelMutation.isPending && channelMutation.variables === 'whatsapp'}
              onClick={() => channelMutation.mutate('whatsapp')}
            >
              WhatsApp{' '}
              {channelsQuery.data?.some((c) => c.channelType === 'whatsapp')
                ? '— Configuração salva'
                : '— Selecionar'}
            </Button>
            <Button
              variant={
                channelsQuery.data?.some((c) => c.channelType === 'webchat')
                  ? 'secondary'
                  : 'outline'
              }
              disabled={!canEdit || channelMutation.isPending}
              loading={channelMutation.isPending && channelMutation.variables === 'webchat'}
              onClick={() => channelMutation.mutate('webchat')}
            >
              Webchat{' '}
              {channelsQuery.data?.some((c) => c.channelType === 'webchat')
                ? '— Configuração salva'
                : '— Selecionar'}
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Instagram e E-mail estão indisponíveis nesta etapa. Nenhuma integração ou credencial é
            ativada.
          </p>
        </Card>
      )}

      {activeStep === 'ativacao' && (
        <Card title="Ativação" icon={CheckCircle2}>
          <div className="space-y-4">
            {checklist.map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                {value ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                )}
                <span>{requirementLabels[key]}</span>
              </div>
            ))}
            <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200">
              Persona do agente e testes ficam em Configurações → Persona do agente — você pode
              configurar depois de ativar o sistema.
            </p>
            {!req.catalogAvailable && (
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-white/10 dark:bg-gray-900/40 dark:text-gray-300">
                Catálogo ainda vazio — opcional. Você pode sincronizar produtos depois sem refazer o
                onboarding.
              </p>
            )}
            <Button
              disabled={!canEdit || activationMutation.isPending || !req.readyForActivation}
              loading={activationMutation.isPending}
              onClick={() => activationMutation.mutate()}
            >
              Ativar ChatBô
            </Button>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => {
            void goTo(currentIndex - 1);
          }}
          disabled={currentIndex <= 0 || isBusy}
        >
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button
          onClick={() => {
            void goTo(currentIndex + 1);
          }}
          disabled={currentIndex >= steps.length - 1 || isBusy}
        >
          Avançar <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
