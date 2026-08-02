import { useNotification } from '@/contexts/NotificationContext';
import { mercosService, type MercosSyncType } from '@/services/mercos.service';
import { extractApiErrorMessage } from '@/utils/apiErrors';
import {
  formatCooldownSeconds,
  getMercosSyncCooldownRemainingMs,
  markMercosSyncCompleted,
} from '@/utils/mercosSyncCooldown';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function invalidateAfterSync(queryClient: ReturnType<typeof useQueryClient>, type: MercosSyncType) {
  queryClient.invalidateQueries({ queryKey: ['mercos'] });
  if (type === 'customers' || type === 'all') {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  }
  if (type === 'products' || type === 'all') {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }
  if (type === 'orders' || type === 'all') {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['funnel'] });
    queryClient.invalidateQueries({ queryKey: ['sales-metrics'] });
  }
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useMercosSync() {
  const queryClient = useQueryClient();
  const { addToast } = useNotification();

  return useMutation({
    mutationFn: (type: MercosSyncType) => {
      const remaining = getMercosSyncCooldownRemainingMs();
      if (remaining > 0) {
        return Promise.reject(
          new Error(`Aguarde ${formatCooldownSeconds(remaining)}s antes de sincronizar de novo (proteção Mercos).`),
        );
      }
      return mercosService.sync(type);
    },
    onSuccess: (result, type) => {
      markMercosSyncCompleted();
      addToast({ title: 'Sincronização concluída', message: result.message, type: 'success' });
      invalidateAfterSync(queryClient, type);
    },
    onError: (err: unknown) => {
      addToast({
        title: 'Erro na sincronização',
        message: extractApiErrorMessage(err),
        type: 'error',
      });
    },
  });
}
