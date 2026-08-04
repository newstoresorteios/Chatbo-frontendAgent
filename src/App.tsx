import { AuthProvider } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { ToastContainer } from '@/components/ui/Toast';
import { AppRoutes } from '@/routes';
import { logger } from '@/utils/logger';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      logger.error('Query failed', {
        queryKey: query.queryKey,
        message: error instanceof Error ? error.message : String(error),
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      logger.error('Mutation failed', {
        mutationKey: mutation.options.mutationKey,
        message: error instanceof Error ? error.message : String(error),
      });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <WorkspaceProvider>
            <NotificationProvider>
              <ChatProvider>
                <BrowserRouter>
                  <AppRoutes />
                  <ToastContainer />
                </BrowserRouter>
              </ChatProvider>
            </NotificationProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
