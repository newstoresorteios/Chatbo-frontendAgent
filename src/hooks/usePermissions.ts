import { useAuth } from '@/contexts/AuthContext';
import { settingsService } from '@/services/settings.service';
import { useQuery } from '@tanstack/react-query';

export function usePermissions() {
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: ['settings', 'permissoes'],
    queryFn: settingsService.getPermissions,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const can = (permission: string) => Boolean(query.data?.permissions?.[permission]);

  return {
    ...query,
    can,
    role: query.data?.role ?? 'user',
    permissions: query.data?.permissions ?? {},
    labels: query.data?.labels ?? {},
  };
}
