import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Loading } from '@/components/ui/EmptyState';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const workspace = useWorkspace();

  if (isLoading || workspace.isLoading) return <Loading className="min-h-screen" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export function PublicRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <Loading className="min-h-screen" />;
  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.accountType === 'system_admin' ? '/system/empresas' : '/dashboard'}
        replace
      />
    );
  }
  return <Outlet />;
}
