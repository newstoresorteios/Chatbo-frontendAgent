import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageState } from '@/components/ui/PageState';
import { Select } from '@/components/ui/Select';
import { useNotification } from '@/contexts/NotificationContext';
import {
  systemAdminService,
  type SystemCompany,
  type SystemCompanyMember,
} from '@/services/systemAdmin.service';
import { extractApiErrorMessage } from '@/utils/apiErrors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, CreditCard, Gauge, Layers3, Plus, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

type Tab = 'empresas' | 'workspaces' | 'planos' | 'assinaturas' | 'uso';

function tabFromPath(pathname: string): Tab {
  if (pathname.includes('/planos')) return 'planos';
  if (pathname.includes('/assinaturas')) return 'assinaturas';
  if (pathname.includes('/uso')) return 'uso';
  if (pathname.includes('/workspaces')) return 'workspaces';
  return 'empresas';
}

export function SystemAdminPage() {
  const location = useLocation();
  const tab = tabFromPath(location.pathname);
  const queryClient = useQueryClient();
  const { addToast } = useNotification();

  const companiesQuery = useQuery({
    queryKey: ['system', 'companies'],
    queryFn: systemAdminService.companies,
  });
  const plansQuery = useQuery({
    queryKey: ['system', 'plans'],
    queryFn: systemAdminService.plans,
    enabled: tab === 'planos' || tab === 'empresas',
  });
  const subscriptionsQuery = useQuery({
    queryKey: ['system', 'subscriptions'],
    queryFn: systemAdminService.subscriptions,
    enabled: tab === 'assinaturas' || tab === 'empresas',
  });
  const usageQuery = useQuery({
    queryKey: ['system', 'usage'],
    queryFn: systemAdminService.usage,
    enabled: tab === 'uso' || tab === 'empresas',
  });

  const [companyOpen, setCompanyOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<SystemCompany | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRole, setAdminRole] = useState<'owner' | 'admin'>('admin');

  const membersQuery = useQuery({
    queryKey: ['system', 'company-members', selectedCompany?.id],
    queryFn: () => systemAdminService.listMembers(selectedCompany!.id),
    enabled: !!selectedCompany?.id,
  });

  const createCompanyMutation = useMutation({
    mutationFn: () =>
      systemAdminService.createCompany({
        name: companyName.trim(),
        brandName: brandName.trim() || undefined,
      }),
    onSuccess: async (company) => {
      addToast({
        title: 'Empresa criada',
        message: `${company.name} · companyId ${company.companyId}`,
        type: 'success',
      });
      setCompanyOpen(false);
      setCompanyName('');
      setBrandName('');
      setSelectedCompany(company);
      await queryClient.invalidateQueries({ queryKey: ['system', 'companies'] });
    },
    onError: (error) => {
      addToast({
        title: 'Não foi possível criar a empresa',
        message: extractApiErrorMessage(error, 'Tente novamente.'),
        type: 'error',
      });
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: () =>
      systemAdminService.createAdmin(selectedCompany!.id, {
        name: adminName.trim(),
        email: adminEmail.trim(),
        password: adminPassword,
        role: adminRole,
      }),
    onSuccess: async (member) => {
      addToast({
        title: 'Admin da empresa criado',
        message: `${member.name} (${member.email}) pode acessar o ChatBô.`,
        type: 'success',
      });
      setAdminOpen(false);
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      setAdminRole('admin');
      await queryClient.invalidateQueries({
        queryKey: ['system', 'company-members', selectedCompany?.id],
      });
      await queryClient.invalidateQueries({ queryKey: ['system', 'companies'] });
    },
    onError: (error) => {
      addToast({
        title: 'Não foi possível criar o admin',
        message: extractApiErrorMessage(error, 'Tente novamente.'),
        type: 'error',
      });
    },
  });

  const companies = companiesQuery.data ?? [];
  const selectedMembers: SystemCompanyMember[] = membersQuery.data ?? [];

  const overviewCards = useMemo(
    () => [
      { label: 'Empresas', value: companies.length, icon: Building2 },
      { label: 'Planos', value: plansQuery.data?.length ?? 0, icon: Layers3 },
      { label: 'Assinaturas', value: subscriptionsQuery.data?.length ?? 0, icon: CreditCard },
      { label: 'Uso', value: usageQuery.data?.length ?? 0, icon: Gauge },
    ],
    [companies.length, plansQuery.data, subscriptionsQuery.data, usageQuery.data],
  );

  if (companiesQuery.isLoading && (tab === 'empresas' || tab === 'workspaces')) {
    return <PageState />;
  }
  if (companiesQuery.isError && (tab === 'empresas' || tab === 'workspaces')) {
    return <PageState error="Não foi possível carregar as empresas." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {tab === 'empresas' && 'Empresas'}
            {tab === 'workspaces' && 'Workspaces / company_id'}
            {tab === 'planos' && 'Planos'}
            {tab === 'assinaturas' && 'Assinaturas'}
            {tab === 'uso' && 'Uso'}
          </h1>
          <p className="mt-2 max-w-3xl text-slate-400">
            Área exclusiva do superadmin (<strong className="text-slate-200">admin@chatbo.com.br</strong>
            ). Cadastre empresas, defina o workspace/company_id e crie os admins que acessam o ChatBô
            daquela empresa.
          </p>
        </div>
        {(tab === 'empresas' || tab === 'workspaces') && (
          <Button onClick={() => setCompanyOpen(true)}>
            <Plus className="h-4 w-4" /> Nova empresa
          </Button>
        )}
      </div>

      {tab === 'empresas' && (
        <div className="grid gap-4 md:grid-cols-4">
          {overviewCards.map(({ label, value, icon: Icon }) => (
            <Card key={label} title={label} icon={Icon}>
              <p className="text-3xl font-bold">{value}</p>
            </Card>
          ))}
        </div>
      )}

      {(tab === 'empresas' || tab === 'workspaces') && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <Card title="Empresas cadastradas">
            <div className="space-y-2">
              {companies.map((company) => {
                const active = selectedCompany?.id === company.id;
                return (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => setSelectedCompany(company)}
                    className={`flex w-full flex-col gap-1 rounded-xl border p-3 text-left transition ${
                      active
                        ? 'border-cyan-400/50 bg-cyan-500/10'
                        : 'border-gray-200 hover:border-cyan-300/40 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{company.name}</p>
                      <Badge variant={company.status === 'active' ? 'success' : 'default'}>
                        {company.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      companyId / workspaceId: <span className="font-mono">{company.companyId}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {company.adminsCount} admin(s) · {company.membersCount} membro(s)
                      {company.brandName ? ` · marca ${company.brandName}` : ''}
                    </p>
                  </button>
                );
              })}
              {companies.length === 0 && (
                <p className="text-sm text-gray-500">Nenhuma empresa cadastrada ainda.</p>
              )}
            </div>
          </Card>

          <Card title={selectedCompany ? `Acessos — ${selectedCompany.name}` : 'Acessos da empresa'}>
            {!selectedCompany ? (
              <p className="text-sm text-gray-500">Selecione uma empresa à esquerda.</p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-slate-300">
                  <p>
                    <strong>companyId:</strong>{' '}
                    <span className="font-mono">{selectedCompany.companyId}</span>
                  </p>
                  <p className="mt-1">
                    <strong>workspaceId:</strong>{' '}
                    <span className="font-mono">{selectedCompany.workspaceId}</span>
                  </p>
                  <p className="mt-2 text-slate-400">
                    Neste modelo, companyId e workspaceId são o mesmo UUID da empresa.
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={() => setAdminOpen(true)}
                  disabled={selectedCompany.status !== 'active'}
                >
                  <UserPlus className="h-4 w-4" /> Cadastrar admin da empresa
                </Button>

                {membersQuery.isLoading && <p className="text-sm text-gray-500">Carregando membros...</p>}
                <div className="space-y-2">
                  {selectedMembers.map((member) => (
                    <div
                      key={member.membershipId}
                      className="rounded-xl border border-gray-200 p-3 text-sm dark:border-gray-700"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{member.name || member.email}</p>
                        <Badge variant={member.role === 'owner' ? 'primary' : 'info'}>
                          {member.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{member.email}</p>
                      <p className="mt-1 text-[11px] text-gray-400">
                        account_type: {member.accountType} ·{' '}
                        {member.active ? 'ativo' : 'inativo'}
                      </p>
                    </div>
                  ))}
                  {!membersQuery.isLoading && selectedMembers.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Nenhum usuário nesta empresa. Cadastre o admin para liberar o acesso ao ChatBô.
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === 'planos' && (
        <Card title="Planos SaaS">
          {plansQuery.isLoading ? (
            <PageState />
          ) : (
            <div className="space-y-2">
              {(plansQuery.data ?? []).map((plan) => (
                <div
                  key={String(plan.id)}
                  className="rounded-xl border border-gray-200 p-3 text-sm dark:border-gray-700"
                >
                  <p className="font-semibold">{String(plan.name ?? plan.code ?? plan.id)}</p>
                  <p className="text-xs text-gray-500">{String(plan.code ?? '')}</p>
                </div>
              ))}
              {(plansQuery.data?.length ?? 0) === 0 && (
                <p className="text-sm text-gray-500">Nenhum plano cadastrado.</p>
              )}
            </div>
          )}
        </Card>
      )}

      {tab === 'assinaturas' && (
        <Card title="Assinaturas">
          {subscriptionsQuery.isLoading ? (
            <PageState />
          ) : (
            <div className="space-y-2">
              {(subscriptionsQuery.data ?? []).map((sub) => (
                <div
                  key={String(sub.id)}
                  className="rounded-xl border border-gray-200 p-3 text-sm dark:border-gray-700"
                >
                  <p className="font-semibold">Workspace {String(sub.workspace_id ?? sub.workspaceId ?? '—')}</p>
                  <p className="text-xs text-gray-500">Status: {String(sub.status ?? '—')}</p>
                </div>
              ))}
              {(subscriptionsQuery.data?.length ?? 0) === 0 && (
                <p className="text-sm text-gray-500">Nenhuma assinatura encontrada.</p>
              )}
            </div>
          )}
        </Card>
      )}

      {tab === 'uso' && (
        <Card title="Contadores de uso">
          {usageQuery.isLoading ? (
            <PageState />
          ) : (
            <div className="space-y-2">
              {(usageQuery.data ?? []).map((row, index) => (
                <div
                  key={`${row.workspace_id}-${row.metric}-${row.period_key}-${index}`}
                  className="rounded-xl border border-gray-200 p-3 text-sm dark:border-gray-700"
                >
                  <p className="font-semibold">{row.metric}</p>
                  <p className="text-xs text-gray-500">
                    {row.workspace_id} · {row.period_key} · {row.used_value}
                  </p>
                </div>
              ))}
              {(usageQuery.data?.length ?? 0) === 0 && (
                <p className="text-sm text-gray-500">Nenhum registro de uso.</p>
              )}
            </div>
          )}
        </Card>
      )}

      <Modal
        open={companyOpen}
        onClose={() => setCompanyOpen(false)}
        title="Cadastrar empresa"
        footer={
          <>
            <Button variant="outline" onClick={() => setCompanyOpen(false)}>
              Cancelar
            </Button>
            <Button
              loading={createCompanyMutation.isPending}
              disabled={!companyName.trim() || createCompanyMutation.isPending}
              onClick={() => createCompanyMutation.mutate()}
            >
              Criar empresa
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Nome da empresa"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Ex.: Loja Exemplo Ltda"
          />
          <Input
            label="Marca (opcional)"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Ex.: Exemplo Store"
          />
          <p className="text-xs text-gray-500">
            Será criado um workspace com <code>company_id = workspace_id</code> e onboarding já
            liberado. Depois cadastre o admin da empresa.
          </p>
        </div>
      </Modal>

      <Modal
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        title="Cadastrar admin da empresa"
        footer={
          <>
            <Button variant="outline" onClick={() => setAdminOpen(false)}>
              Cancelar
            </Button>
            <Button
              loading={createAdminMutation.isPending}
              disabled={
                !selectedCompany ||
                !adminName.trim() ||
                !adminEmail.trim() ||
                adminPassword.length < 6 ||
                createAdminMutation.isPending
              }
              onClick={() => createAdminMutation.mutate()}
            >
              Criar admin
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Empresa: <strong>{selectedCompany?.name}</strong>
          </p>
          <Input
            label="Nome"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            placeholder="Nome do administrador"
          />
          <Input
            label="E-mail de acesso"
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="admin@empresa.com"
          />
          <Input
            label="Senha inicial"
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
          <Select
            label="Papel na empresa"
            value={adminRole}
            onChange={(e) => setAdminRole(e.target.value as 'owner' | 'admin')}
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'owner', label: 'Owner' },
            ]}
          />
          <p className="text-xs text-gray-500">
            Esse usuário entra como <code>workspace_user</code> (admin da empresa), não como
            superadmin. Só <strong>admin@chatbo.com.br</strong> acessa esta console.
          </p>
        </div>
      </Modal>
    </div>
  );
}
