import { Loading } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { usePermissions } from '@/hooks/usePermissions';
import { defaultAppHome } from '@/utils/appHome';
import { Navigate, Outlet } from 'react-router-dom';

interface PermissionRouteProps {
  permission: string;
}

export function PermissionRoute({ permission }: PermissionRouteProps) {
  const { user } = useAuth();
  const workspace = useWorkspace();
  const { can, role, isLoading, isFetching } = usePermissions();

  if (isLoading || isFetching) {
    return <Loading className="min-h-[50vh]" />;
  }

  const isCompanyAdmin =
    role === 'admin'
    || user?.role === 'admin'
    || workspace.role === 'owner'
    || workspace.role === 'admin';

  const isElevated = isCompanyAdmin || role === 'supervisor' || workspace.role === 'supervisor';

  const allowed =
    can(permission)
    || (permission === 'manageUsers' && isCompanyAdmin)
    || (
      isElevated
      && ['viewFinancial', 'viewReports', 'managePlatform', 'manageIntegrations'].includes(permission)
    );

  if (!allowed) {
    return <Navigate to={defaultAppHome(user)} replace />;
  }

  return <Outlet />;
}
