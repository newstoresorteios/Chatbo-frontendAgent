import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotification } from '@/contexts/NotificationContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { usePermissions } from '@/hooks/usePermissions';
import { settingsService, type CompanySettings } from '@/services/settings.service';
import { roleLabel } from '@/services/users.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function CompanySettingsPanel() {
  const workspace = useWorkspace();
  const { can } = usePermissions();
  const { addToast } = useNotification();
  const queryClient = useQueryClient();
  const canManageCompany = ['owner', 'admin'].includes(workspace.role) || can('manageUsers');

  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'empresa'],
    queryFn: settingsService.getCompany,
  });

  const [form, setForm] = useState<CompanySettings>({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => settingsService.saveCompany(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'empresa'] });
      addToast({ title: 'Empresa salva', message: 'Dados persistidos no Supabase', type: 'success' });
    },
    onError: () => {
      addToast({ title: 'Erro', message: 'Não foi possível salvar a empresa', type: 'error' });
    },
  });

  if (isLoading) return <p className="text-sm text-gray-500">Carregando...</p>;

  return (
    <div className="space-y-4">
      {!canManageCompany && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          Apenas responsáveis pela empresa podem editar estes dados.
        </p>
      )}
      <Input
        label="Nome da empresa"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        disabled={!canManageCompany}
      />
      <Input
        label="CNPJ"
        value={form.cnpj}
        onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
        disabled={!canManageCompany}
      />
      <Input
        label="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        disabled={!canManageCompany}
      />
      <Input
        label="Telefone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        disabled={!canManageCompany}
      />
      {canManageCompany && (
        <div className="flex justify-end">
          <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
            Salvar empresa
          </Button>
        </div>
      )}
    </div>
  );
}

export function NotificationsSettingsPanel() {
  const { addToast } = useNotification();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'preferencias'],
    queryFn: settingsService.getPreferences,
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    newMessage: true,
    newLead: false,
    dailyReport: true,
  });

  useEffect(() => {
    if (data?.notifications) setNotifications(data.notifications);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => settingsService.savePreferences(notifications),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'preferencias'] });
      addToast({ title: 'Preferências salvas', message: 'Notificações atualizadas no seu perfil', type: 'success' });
    },
    onError: () => {
      addToast({ title: 'Erro', message: 'Não foi possível salvar preferências', type: 'error' });
    },
  });

  const toggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) return <p className="text-sm text-gray-500">Carregando...</p>;

  const items = [
    ['email', 'Notificações por e-mail'],
    ['push', 'Notificações push no navegador'],
    ['newMessage', 'Nova mensagem recebida'],
    ['newLead', 'Novo lead no funil'],
    ['dailyReport', 'Relatório diário'],
  ] as const;

  return (
    <div className="space-y-3">
      {items.map(([key, label]) => (
        <label
          key={key}
          className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
        >
          <span className="text-sm">{label}</span>
          <input
            type="checkbox"
            checked={notifications[key]}
            onChange={() => toggle(key)}
            className="rounded border-gray-300"
          />
        </label>
      ))}
      <div className="flex justify-end pt-2">
        <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
          Salvar notificações
        </Button>
      </div>
    </div>
  );
}

export function PermissionsSettingsPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'permissoes'],
    queryFn: settingsService.getPermissions,
  });

  if (isLoading) return <p className="text-sm text-gray-500">Carregando...</p>;

  const perms = data?.permissions ?? {};
  const labels = data?.labels ?? {};

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Seu perfil:</span>
        <Badge variant="primary">{roleLabel(data?.role ?? 'user')}</Badge>
      </div>
      <p className="text-sm text-gray-500">
        Permissões vêm do perfil do usuário. Para alterar, ajuste o perfil em Equipe e acessos.
      </p>
      <div className="space-y-3">
        {Object.entries(labels).map(([key, label]) => (
          <label
            key={key}
            className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
          >
            <span className="text-sm">{label}</span>
            <Badge variant={perms[key] ? 'success' : 'default'}>
              {perms[key] ? 'Permitido' : 'Negado'}
            </Badge>
          </label>
        ))}
      </div>
    </div>
  );
}

export function SecuritySettingsPanel() {
  const { addToast } = useNotification();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const changeMutation = useMutation({
    mutationFn: () => settingsService.changePassword(currentPassword, newPassword),
    onSuccess: (res) => {
      addToast({ title: 'Senha alterada', message: res.message, type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Não foi possível alterar a senha';
      addToast({ title: 'Erro', message: String(detail), type: 'error' });
    },
  });

  const handleSubmit = () => {
    if (newPassword.length < 6) {
      addToast({ title: 'Senha fraca', message: 'Mínimo 6 caracteres', type: 'warning' });
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast({ title: 'Confirmação', message: 'As senhas não coincidem', type: 'warning' });
      return;
    }
    changeMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <Input
        label="Senha atual"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <Input
        label="Nova senha"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <Input
        label="Confirmar nova senha"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <div className="flex justify-end">
        <Button onClick={handleSubmit} loading={changeMutation.isPending}>
          Alterar senha
        </Button>
      </div>
    </div>
  );
}
