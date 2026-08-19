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
