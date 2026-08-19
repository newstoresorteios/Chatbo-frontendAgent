import { PERSONA_ACTIVATION_FIELD_LABELS } from '@/features/persona/activationRequirements';

const GENERIC_AXIOS_MESSAGE = /^Request failed with status code \d+$/;

type ApiErrorShape = {
  code?: string;
  isAxiosError?: boolean;
  response?: {
    status?: number;
    data?: {
      detail?: unknown;
      message?: unknown;
    };
  };
  message?: string;
};

function fieldLabel(loc: unknown): string {
  if (!Array.isArray(loc)) return '';
  const parts = loc.filter((part) => part !== 'body' && part !== 'query');
  return parts.map(String).join('.');
}

function detailToMessage(detail: unknown): string | null {
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === 'object' && item && 'msg' in item) {
          const row = item as { loc?: unknown; msg: string; type?: string };
          const field = fieldLabel(row.loc);
          const msg = String(row.msg);
          if (row.type === 'too_long' || msg.toLowerCase().includes('at most')) {
            return field
              ? `O campo ${field} ultrapassou o limite permitido.`
              : 'Um dos campos da persona ultrapassou o limite permitido.';
          }
          return field ? `${field}: ${msg}` : msg;
        }
        return String(item);
      })
      .filter(Boolean);
    if (messages.length > 0) return messages.join(' ');
  }

  if (detail && typeof detail === 'object') {
    const row = detail as { message?: unknown; missingFields?: unknown };
    const message = typeof row.message === 'string' ? row.message.trim() : '';
    const fields = Array.isArray(row.missingFields)
      ? row.missingFields.map((item) => PERSONA_ACTIVATION_FIELD_LABELS[String(item)] ?? String(item))
      : [];
    if (message && fields.length) {
      const alreadyListsFields = fields.some((field) => message.includes(field));
      return alreadyListsFields ? message : `${message} Preencha: ${fields.join(', ')}.`;
    }
    if (message) return message;
    if (fields.length) {
      return `A persona ainda não pode ser ativada. Preencha: ${fields.join(', ')}.`;
    }
  }

  return null;
}

export function extractApiErrorMessage(
  error: unknown,
  fallback = 'Ocorreu um erro. Tente novamente.',
): string {
  const axiosError = error as ApiErrorShape;

  if (axiosError.code === 'ECONNABORTED') {
    return 'Servidor demorou para responder. Aguarde um momento e tente de novo.';
  }

  if (!axiosError.response) {
    if (
      !axiosError.isAxiosError
      && error instanceof Error
      && error.message
      && !GENERIC_AXIOS_MESSAGE.test(error.message)
    ) {
      return error.message;
    }
    return 'Não foi possível conectar ao servidor ChatBô. Verifique se o backend está disponível.';
  }

  const fromDetail = detailToMessage(axiosError.response.data?.detail);
  if (fromDetail) return fromDetail;

  const fromMessage = detailToMessage(axiosError.response.data?.message);
  if (fromMessage) return fromMessage;

  const status = axiosError.response.status;
  if (status === 401) return 'E-mail ou senha incorretos';
  if (status === 403) return 'Acesso negado para esta conta';
  if (status === 409) return 'Este e-mail já está cadastrado';
  if (status === 429) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  if (status && status >= 500) {
    return 'Serviço temporariamente indisponível. Tente novamente em instantes.';
  }

  if (error instanceof Error && error.message && !GENERIC_AXIOS_MESSAGE.test(error.message)) {
    return error.message;
  }

  return fallback;
}
