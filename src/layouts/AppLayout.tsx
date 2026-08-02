import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-gray-900 dark:bg-chatbo-background dark:text-slate-100">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main id="app-scroll-container" className="dashboard-grid-bg relative z-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_30%)] p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
