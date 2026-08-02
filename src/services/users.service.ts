import { api } from './api';

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  active: boolean;
  createdAt?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  company?: string;
}

export interface UpdateUserPayload {
  name?: string;
  role?: string;
  active?: boolean;
  company?: string;
}

export const usersService = {
  list: async (): Promise<PlatformUser[]> => {
    const { data } = await api.get<PlatformUser[]>('/usuarios');
    return data;
  },

  create: async (payload: CreateUserPayload): Promise<PlatformUser> => {
    const { data } = await api.post<PlatformUser>('/usuarios', payload);
    return data;
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<PlatformUser> => {
    const { data } = await api.patch<PlatformUser>(`/usuarios/${id}`, payload);
    return data;
  },
};

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  vendedor: 'Atendente',
  user: 'Usuário',
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}
