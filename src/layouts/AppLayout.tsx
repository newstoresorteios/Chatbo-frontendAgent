import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { UnclaimedConversationAlert } from '@/components/layout/UnclaimedConversationAlert';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/utils';
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { isInboxExpanded } = useChat();
  const isInbox = /^\/(atendimento|conversas)\/?$/.test(pathname);
  const expanded = isInbox && isInboxExpanded;

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50 text-gray-900 dark:bg-chatbo-background dark:text-slate-100">
      <UnclaimedConversationAlert />
      {!expanded && <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {!expanded && <Header onMenuClick={() => setMobileOpen(true)} />}
        <main id="app-scroll-container" className={cn(
          'dashboard-grid-bg relative z-0 min-h-0 flex-1 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_30%)]',
          isInbox ? 'overflow-hidden' : 'overflow-y-auto p-4 lg:p-6',
        )}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
