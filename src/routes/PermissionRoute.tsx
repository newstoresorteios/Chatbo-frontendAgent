import { Loading } from '@/components/ui/EmptyState';
import { usePermissions } from '@/hooks/usePermissions';
import { Navigate, Outlet } from 'react-router-dom';

interface PermissionRouteProps {
  permission: string;
}

export function PermissionRoute({ permission }: PermissionRouteProps) {
  const { can, isLoading, isFetching } = usePermissions();

  if (isLoading || isFetching) {
    return <Loading className="min-h-[50vh]" />;
  }

  if (!can(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
