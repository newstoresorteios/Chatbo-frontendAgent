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

  const role = query.data?.role ?? 'user';
  const permissions = query.data?.permissions ?? {};

  const can = (permission: string) => {
    if (Boolean(permissions[permission])) return true;
    // Admin/supervisor nunca ficam sem áreas comerciais se o backend ainda
    // não devolver a chave viewFinancial (deploy desalinhado).
    if (permission === 'viewFinancial') {
      return Boolean(
        permissions.manageUsers
        || permissions.managePlatform
        || permissions.manageIntegrations
        || role === 'admin'
        || role === 'supervisor',
      );
    }
    if (role === 'admin') {
      return ['viewReports', 'manageUsers', 'manageIntegrations', 'managePlatform', 'exportData'].includes(
        permission,
      );
    }
    return false;
  };

  return {
    ...query,
    can,
    role,
    permissions,
    labels: query.data?.labels ?? {},
  };
}
