import { api } from './api';

export interface WhatsAppStatus {
  configured: boolean;
  connected: boolean;
  provider: string;
  webhookUrl: string;
  phoneNumberId?: string;
  displayPhone?: string;
  canalId?: string;
  providerStatus?: string;
  message?: string;
}

export interface WhatsAppConnectPayload {
  name: string;
  phoneNumberId?: string;
  accessToken?: string;
  displayPhone?: string;
  wabaId?: string;
}

export const whatsappService = {
  getStatus: async (): Promise<WhatsAppStatus> => {
    const { data } = await api.get<WhatsAppStatus>('/whatsapp/status');
    return data;
  },

  testConnection: async (): Promise<{ ok: boolean; message: string; displayPhone?: string }> => {
    const { data } = await api.post<{ ok: boolean; message: string; displayPhone?: string }>(
      '/whatsapp/testar-conexao',
    );
    return data;
  },

  connect: async (payload: WhatsAppConnectPayload) => {
    const { data } = await api.post('/whatsapp/conectar', payload);
    return data;
  },
};
