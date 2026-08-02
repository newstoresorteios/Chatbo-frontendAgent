import { Loading } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { isSystemAdmin } from '@/utils/sessionScope';
import { Navigate, Outlet } from 'react-router-dom';

export function SystemAdminRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading className="min-h-screen" />;
  if (!isSystemAdmin(user)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
