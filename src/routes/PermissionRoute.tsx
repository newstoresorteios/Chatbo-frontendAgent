import { Loading } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { defaultAppHome } from '@/utils/appHome';
import { Navigate, Outlet } from 'react-router-dom';

interface PermissionRouteProps {
  permission: string;
}

export function PermissionRoute({ permission }: PermissionRouteProps) {
  const { user } = useAuth();
  const { can, isLoading, isFetching } = usePermissions();

  if (isLoading || isFetching) {
    return <Loading className="min-h-[50vh]" />;
  }

  if (!can(permission)) {
    return <Navigate to={defaultAppHome(user)} replace />;
  }

  return <Outlet />;
}
