import { AppLayout } from '@/layouts/AppLayout';
import { LandingPage } from '@/pages/LandingPage';
import { LegalPage } from '@/pages/LegalPage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { PlansPage } from '@/pages/PlansPage';
import { SystemAdminRoute } from '@/routes/SystemAdminRoute';
import { SystemAdminLayout } from '@/layouts/SystemAdminLayout';
import { PermissionRoute } from '@/routes/PermissionRoute';
import { ProtectedRoute, PublicRoute } from '@/routes/ProtectedRoute';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RouteLoadingFallback } from '@/components/ui/PageState';

const CampaignsPage = lazy(() => import('@/pages/CampaignsPage').then((m) => ({ default: m.CampaignsPage })));
const ChannelsPage = lazy(() => import('@/pages/ChannelsPage').then((m) => ({ default: m.ChannelsPage })));
const ChatbotPage = lazy(() => import('@/pages/ChatbotPage').then((m) => ({ default: m.ChatbotPage })));
const CustomersPage = lazy(() => import('@/pages/CustomersPage').then((m) => ({ default: m.CustomersPage })));
const FunnelPage = lazy(() => import('@/pages/FunnelPage').then((m) => ({ default: m.FunnelPage })));
const IntegrationsPage = lazy(() => import('@/pages/IntegrationsPage').then((m) => ({ default: m.IntegrationsPage })));
const SystemAdminPage = lazy(() => import('@/pages/SystemAdminPage').then((m) => ({ default: m.SystemAdminPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const PersonaPage = lazy(() => import('@/pages/PersonaPage').then((m) => ({ default: m.PersonaPage })));
const SubscriptionPage = lazy(() => import('@/pages/SubscriptionPage').then((m) => ({ default: m.SubscriptionPage })));

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ConversationsPage = lazy(() => import('@/pages/ConversationsPage').then((m) => ({ default: m.ConversationsPage })));
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const InsightsPage = lazy(() => import('@/pages/InsightsPage').then((m) => ({ default: m.InsightsPage })));
const ProductsPage = lazy(() => import('@/pages/ProductsPage').then((m) => ({ default: m.ProductsPage })));
const OrdersPage = lazy(() => import('@/pages/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const CopilotPage = lazy(() => import('@/pages/CopilotPage').then((m) => ({ default: m.CopilotPage })));
const BusinessProfilePage = lazy(() => import('@/pages/BusinessProfilePage').then((m) => ({ default: m.BusinessProfilePage })));
const AgentTracesPage = lazy(() => import('@/pages/AgentTracesPage').then((m) => ({ default: m.AgentTracesPage })));
const AgentLearningPage = lazy(() => import('@/pages/AgentLearningPage').then((m) => ({ default: m.AgentLearningPage })));
const AgentAdvancedSettingsPage = lazy(() => import('@/pages/AgentAdvancedSettingsPage').then((m) => ({ default: m.AgentAdvancedSettingsPage })));

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<RouteLoadingFallback />}>{children}</Suspense>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/politica-privacidade" element={<PrivacyPolicyPage />} />
      <Route path="/legal/privacidade" element={<Navigate to="/politica-privacidade" replace />} />
      <Route path="/legal/:slug" element={<LegalPage />} />
      <Route path="/planos" element={<PlansPage />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<SystemAdminRoute />}>
        <Route element={<SystemAdminLayout />}>
          <Route path="/system/empresas" element={<LazyPage><SystemAdminPage /></LazyPage>} />
          <Route path="/system/workspaces" element={<LazyPage><SystemAdminPage /></LazyPage>} />
          <Route path="/system/planos" element={<LazyPage><SystemAdminPage /></LazyPage>} />
          <Route path="/system/assinaturas" element={<LazyPage><SystemAdminPage /></LazyPage>} />
          <Route path="/system/uso" element={<LazyPage><SystemAdminPage /></LazyPage>} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/atendimento" element={<LazyPage><ConversationsPage /></LazyPage>} />
          <Route path="/conversas" element={<Navigate to="/atendimento" replace />} />
          <Route path="/contatos" element={<LazyPage><CustomersPage /></LazyPage>} />
          <Route path="/clientes" element={<Navigate to="/contatos" replace />} />
          <Route path="/produtos" element={<LazyPage><ProductsPage /></LazyPage>} />
          <Route path="/configuracoes" element={<LazyPage><SettingsPage /></LazyPage>} />
          <Route path="/perfil" element={<LazyPage><ProfilePage /></LazyPage>} />
          <Route path="/onboarding" element={<Navigate to="/atendimento" replace />} />

          <Route element={<PermissionRoute permission="viewFinancial" />}>
            <Route path="/dashboard" element={<LazyPage><DashboardPage /></LazyPage>} />
            <Route path="/pedidos" element={<LazyPage><OrdersPage /></LazyPage>} />
            <Route path="/funil" element={<LazyPage><FunnelPage /></LazyPage>} />
          </Route>

          <Route element={<PermissionRoute permission="managePlatform" />}>
            <Route path="/canais" element={<LazyPage><ChannelsPage /></LazyPage>} />
            <Route path="/campanhas" element={<LazyPage><CampaignsPage /></LazyPage>} />
            <Route path="/copiloto" element={<LazyPage><CopilotPage /></LazyPage>} />
            <Route path="/robo" element={<LazyPage><ChatbotPage /></LazyPage>} />
            <Route path="/agente-ia" element={<Navigate to="/copiloto" replace />} />
            <Route path="/persona" element={<LazyPage><PersonaPage /></LazyPage>} />
            <Route path="/agente/configuracao-avancada" element={<LazyPage><AgentAdvancedSettingsPage /></LazyPage>} />
            <Route path="/agente/aprendizado" element={<LazyPage><AgentLearningPage /></LazyPage>} />
            <Route path="/agente/execucoes" element={<LazyPage><AgentTracesPage /></LazyPage>} />
          </Route>

          <Route element={<PermissionRoute permission="viewReports" />}>
            <Route path="/relatorios" element={<LazyPage><ReportsPage /></LazyPage>} />
            <Route path="/insights" element={<LazyPage><InsightsPage /></LazyPage>} />
          </Route>

          <Route element={<PermissionRoute permission="manageIntegrations" />}>
            <Route path="/integracoes" element={<LazyPage><IntegrationsPage /></LazyPage>} />
          </Route>

          <Route element={<PermissionRoute permission="manageUsers" />}>
            <Route path="/configuracoes/assinatura" element={<LazyPage><SubscriptionPage /></LazyPage>} />
            <Route path="/minha-empresa" element={<LazyPage><BusinessProfilePage /></LazyPage>} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
