import { api } from './api';

export interface CompanySettings {
  name: string;
  brandName?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  segment?: string;
  website?: string;
  country?: string;
  currency?: string;
  salesModel?: 'b2b' | 'b2c' | 'mixed';
  salesChannels?: string[];
  businessHours?: string;
  primaryContact?: string;
  agentDisplayName?: string;
  agentRole?: string;
  agentLanguage?: string;
  agentPrimaryChannel?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  newMessage: boolean;
  newLead: boolean;
  dailyReport: boolean;
}

export interface RolePermissions {
  role: string;
  permissions: Record<string, boolean>;
  labels: Record<string, string>;
}

export const settingsService = {
  getCompany: async (): Promise<CompanySettings> => {
    const { data } = await api.get<CompanySettings>('/settings/empresa');
    return data;
  },

  saveCompany: async (payload: Partial<CompanySettings>): Promise<CompanySettings> => {
    const { data } = await api.patch<CompanySettings>('/settings/empresa', payload);
    return data;
  },

  getPreferences: async (): Promise<{ notifications: NotificationSettings }> => {
    const { data } = await api.get<{ notifications: NotificationSettings }>('/settings/preferencias');
    return data;
  },

  savePreferences: async (notifications: NotificationSettings): Promise<{ notifications: NotificationSettings }> => {
    const { data } = await api.patch<{ notifications: NotificationSettings }>(
      '/settings/preferencias',
      notifications,
    );
    return data;
  },

  getPermissions: async (): Promise<RolePermissions> => {
    const { data } = await api.get<RolePermissions>('/settings/permissoes');
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.post<{ success: boolean; message: string }>('/settings/alterar-senha', {
      currentPassword,
      newPassword,
    });
    return data;
  },
};
