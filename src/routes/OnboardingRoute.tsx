import { Loading } from '@/components/ui/EmptyState';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Navigate, Outlet } from 'react-router-dom';

export function OnboardingRoute() {
  const workspace = useWorkspace();

  if (workspace.isLoading) return <Loading className="min-h-[50vh]" />;
  if (workspace.onboardingStatus === 'complete') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
