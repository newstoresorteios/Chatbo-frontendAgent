import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { USE_MOCK } from '@/config/runtime';
import { mockUser } from '@/data/mocks';
import { authService, REFRESH_KEY, TOKEN_KEY, USER_KEY } from '@/services/api';
import { extractApiErrorMessage } from '@/utils/apiErrors';
import { normalizeSessionUser } from '@/utils/sessionScope';
import type { LoginCredentials, RegisterCredentials, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persistSession(token: string, refreshToken: string, authUser: User) {
  const normalizedUser = normalizeSessionUser(authUser);
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

function isPersistedUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<User>;
  return Boolean(candidate.id && candidate.email && candidate.role);
}

function readStoredSessionUser(): User | null {
  const storedToken = localStorage.getItem(TOKEN_KEY);
  if (!USE_MOCK && storedToken?.startsWith('mock-')) {
    clearSession();
    return null;
  }

  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as unknown;
    if (!isPersistedUser(parsed)) {
      clearSession();
      return null;
    }
    return normalizeSessionUser(parsed);
  } catch {
    clearSession();
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredSessionUser());
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY) && !USE_MOCK));

  useEffect(() => {
    if (USE_MOCK) {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    let active = true;
    authService.me()
      .then(({ data }) => {
        if (!active) return;
        const authUser = normalizeSessionUser(data);
        localStorage.setItem(USER_KEY, JSON.stringify(authUser));
        setUser(authUser);
      })
      .catch(() => {
        if (!active) return;
        setUser((current) => current);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Credenciais inválidas');
      }

      if (USE_MOCK) {
        await new Promise((resolve) => {
          setTimeout(resolve, 800);
        });
        const authUser = normalizeSessionUser({ ...mockUser, email: credentials.email });
        persistSession('mock-jwt-token', 'mock-refresh-token', authUser);
        setUser(authUser);
        return;
      }

      const { data } = await authService.login(credentials);
      const authUser = normalizeSessionUser(data.user);
      persistSession(data.token, data.refreshToken, authUser);
      setUser(authUser);
    } catch (error: unknown) {
      throw new Error(extractApiErrorMessage(error, 'Não foi possível entrar'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      if (!credentials.name || !credentials.email || !credentials.password) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      if (USE_MOCK) {
        await new Promise((resolve) => {
          setTimeout(resolve, 800);
        });
        const authUser: User = {
          id: `mock-${Date.now()}`,
          name: credentials.name,
          email: credentials.email,
          role: 'user',
          company: credentials.company || 'ChatBô',
        };
        const normalized = normalizeSessionUser(authUser);
        persistSession('mock-jwt-token', 'mock-refresh-token', normalized);
        setUser(normalized);
        return normalized;
      }

      const { data } = await authService.register(credentials);
      const authUser = normalizeSessionUser(data.user);
      persistSession(data.token, data.refreshToken, authUser);
      setUser(authUser);
      return authUser;
    } catch (error: unknown) {
      throw new Error(extractApiErrorMessage(error, 'Não foi possível criar a conta'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (!USE_MOCK) {
      const refreshToken = localStorage.getItem(REFRESH_KEY) ?? undefined;
      authService.logout(refreshToken).catch(() => undefined);
    }
    clearSession();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (patch: Partial<User>) => {
    if (USE_MOCK) {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = normalizeSessionUser({ ...prev, ...patch });
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const { data } = await authService.updateProfile({
      name: patch.name,
      company: patch.company,
    });
    const authUser = normalizeSessionUser(data);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, isLoading, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
