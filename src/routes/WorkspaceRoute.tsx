import { Loading } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { Outlet } from 'react-router-dom';

export function WorkspaceRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loading className="min-h-screen" />;
  if (!isAuthenticated) return null;

  return <Outlet />;
}
