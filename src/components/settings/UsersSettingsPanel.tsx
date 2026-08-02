import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useNotification } from '@/contexts/NotificationContext';
import {
  ROLE_LABELS,
  roleLabel,
  usersService,
  type PlatformUser,
} from '@/services/users.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

export function UsersSettingsPanel() {
  const { user: currentUser } = useAuth();
  const { can } = usePermissions();
  const { addToast } = useNotification();
  const queryClient = useQueryClient();
  const canManageUsers = can('manageUsers');

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['usuarios'],
    queryFn: usersService.list,
  });

  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'vendedor',
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['usuarios'] });

  const createMutation = useMutation({
    mutationFn: () =>
      usersService.create({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        company: currentUser?.company,
      }),
    onSuccess: (created) => {
      addToast({
        title: 'Usuário criado',
        message: `${created.name} (${created.email}) pode fazer login agora.`,
        type: 'success',
      });
      setInviteOpen(false);
      setForm({ name: '', email: '', password: '', role: 'vendedor' });
      invalidate();
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Não foi possível criar o usuário';
      addToast({ title: 'Erro', message: String(detail), type: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof usersService.update>[1] }) =>
      usersService.update(id, patch),
    onSuccess: () => invalidate(),
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Falha ao atualizar usuário';
      addToast({ title: 'Erro', message: String(detail), type: 'error' });
    },
  });

  const handleToggleActive = (u: PlatformUser) => {
    updateMutation.mutate({ id: u.id, patch: { active: !u.active } });
  };

  const handleRoleChange = (u: PlatformUser, role: string) => {
    if (role === u.role) return;
    updateMutation.mutate({ id: u.id, patch: { role } });
  };

  if (isLoading) return <Loading />;

  if (isError) {
    return (
      <p className="text-sm text-red-600">
        Não foi possível carregar usuários. Verifique se a tabela usuarios existe no Supabase
        (python scripts/seed_usuarios.py).
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-400">
        <p>
          Usuários reais do ChatBô — autenticação via Supabase. Total:{' '}
          <strong>{users?.length ?? 0}</strong>
          {!canManageUsers && ' (somente leitura — peça a um administrador para convidar ou editar).'}
        </p>
      </div>

      <div className="space-y-3">
        {(users ?? []).map((u) => (
          <UserRow
            key={u.id}
            user={u}
            canManageUsers={canManageUsers}
            isSelf={u.id === currentUser?.id}
            onToggleActive={() => handleToggleActive(u)}
            onRoleChange={(role) => handleRoleChange(u, role)}
            updating={updateMutation.isPending}
          />
        ))}
        {(users ?? []).length === 0 && (
          <p className="text-sm text-gray-500">Nenhum usuário cadastrado.</p>
        )}
      </div>

      {canManageUsers && (
        <>
          <Button variant="outline" onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Convidar usuário
          </Button>

          <Modal
            open={inviteOpen}
            onClose={() => setInviteOpen(false)}
            title="Novo usuário"
            footer={
              <>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => createMutation.mutate()}
                  loading={createMutation.isPending}
                  disabled={!form.name || !form.email || form.password.length < 6}
                >
                  Criar usuário
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input
                label="Nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="E-mail"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                label="Senha inicial"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <Select
                label="Perfil"
                options={ROLE_OPTIONS}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}

function UserRow({
  user,
  canManageUsers,
  isSelf,
  onToggleActive,
  onRoleChange,
  updating,
}: {
  user: PlatformUser;
  canManageUsers: boolean;
  isSelf: boolean;
  onToggleActive: () => void;
  onRoleChange: (role: string) => void;
  updating: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-100 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
      <div className="flex items-center gap-3">
        <Avatar name={user.name} size="sm" />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {user.name}
            {isSelf && <span className="ml-2 text-xs text-gray-400">(você)</span>}
          </p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={user.active ? 'success' : 'default'}>
          {user.active ? 'Ativo' : 'Inativo'}
        </Badge>
        {canManageUsers ? (
          <>
            <Select
              options={ROLE_OPTIONS}
              value={user.role}
              onChange={(e) => onRoleChange(e.target.value)}
              className="!w-auto min-w-[140px]"
            />
            {!isSelf && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleActive}
                loading={updating}
              >
                {user.active ? 'Desativar' : 'Ativar'}
              </Button>
            )}
          </>
        ) : (
          <Badge variant="default">{roleLabel(user.role)}</Badge>
        )}
      </div>
    </div>
  );
}
