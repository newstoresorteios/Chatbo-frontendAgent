import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types';
import { logger } from '@/utils/logger';
import { normalizeSessionUser } from '@/utils/sessionScope';

function normalizeApiUrl(value: string | undefined): string {
  const normalized = (value ?? '/api').trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');
  return normalized || '/api';
}

/**
 * Prefer same-origin `/api` in the browser when the configured URL is a Render host.
 * Calling Render directly from chatbo.com.br triggers CORS; Vercel rewrites `/api` → backend.
 */
function resolveApiUrl(value: string | undefined): string {
  const normalized = normalizeApiUrl(value);

  if (typeof window === 'undefined' || !/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  try {
    const url = new URL(normalized);
    if (url.hostname.endsWith('.onrender.com')) {
      return '/api';
    }
  } catch {
    return normalized;
  }

  return normalized;
}

const API_URL = resolveApiUrl(import.meta.env.VITE_API_URL);

export const TOKEN_KEY = 'pulsedesk_token';
export const REFRESH_KEY = 'pulsedesk_refresh';
export const USER_KEY = 'pulsedesk_user';

const AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh',
];

function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 120_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const method = (config.method ?? 'get').toUpperCase();
  const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
  logger.debug('API request', { method, url });

  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => {
    const method = (response.config.method ?? 'get').toUpperCase();
    const url = `${response.config.baseURL ?? ''}${response.config.url ?? ''}`;
    logger.info('API response', {
      method,
      url,
      status: response.status,
    });
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as RetryConfig | undefined;
    const url = String(original?.url ?? '');
    const method = (original?.method ?? 'get').toUpperCase();
    const fullUrl = original ? `${original.baseURL ?? ''}${original.url ?? ''}` : url;

    logger.error('API error', {
      method,
      url: fullUrl,
      status,
      code: error.code,
      message: error.message,
      data: error.response?.data,
    });

    if (
      status !== 401
      || !original
      || original._retry
      || AUTH_PATHS.some((path) => url.includes(path))
    ) {
      if (status === 401 && !AUTH_PATHS.some((path) => url.includes(path))) {
        logger.warn('Session expired, redirecting to login', { url: fullUrl });
        clearAuthStorage();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken || refreshToken === 'undefined') {
      logger.warn('Refresh token missing, redirecting to login', { url: fullUrl });
      clearAuthStorage();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      logger.info('Refreshing auth token', { url: fullUrl });
      const { data } = await axios.post<AuthResponse>(`${API_URL}/auth/refresh`, {
        refreshToken,
      });
      const authUser = normalizeSessionUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(REFRESH_KEY, data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));

      refreshQueue.forEach((callback) => callback(data.token));
      refreshQueue = [];

      original.headers.Authorization = `Bearer ${data.token}`;
      return api(original);
    } catch (refreshError) {
      logger.error('Auth refresh failed', {
        url: fullUrl,
        message: refreshError instanceof Error ? refreshError.message : String(refreshError),
      });
      refreshQueue = [];
      clearAuthStorage();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials),
  register: (credentials: RegisterCredentials) =>
    api.post<AuthResponse>('/auth/register', credentials),
  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }),
  forgotPassword: (email: string) =>
    api.post<{ success: boolean; message: string; resetUrl?: string }>(
      '/auth/forgot-password',
      { email },
    ),
  resetPassword: (token: string, password: string) =>
    api.post<{ success: boolean; message: string }>('/auth/reset-password', {
      token,
      password,
    }),
  updateProfile: (patch: { name?: string; company?: string }) =>
    api.patch<User>('/auth/profile', patch),
  me: () => api.get<User>('/auth/me'),
  logout: (refreshToken?: string) =>
    api.post('/auth/logout', refreshToken ? { refreshToken } : {}),
};
