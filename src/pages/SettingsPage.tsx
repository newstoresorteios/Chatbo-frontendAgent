import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  CompanySettingsPanel,
  NotificationsSettingsPanel,
  PermissionsSettingsPanel,
  SecuritySettingsPanel,
} from '@/components/settings/GeneralSettingsPanels';
import { MercosSettingsPanel } from '@/components/settings/MercosSettingsPanel';
import { SystemStatusPanel } from '@/components/settings/SystemStatusPanel';
import { UsersSettingsPanel } from '@/components/settings/UsersSettingsPanel';
import { WhatsAppSettingsPanel } from '@/components/settings/WhatsAppSettingsPanel';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import {
  filterSettingsNavItems,
  SETTINGS_NAV_ITEMS,
  settingsTabPath,
} from '@/features/settings/settingsNav';
import { usePermissions } from '@/hooks/usePermissions';
import { aiSettingsStore } from '@/store/aiSettingsStore';
import { isSystemAdmin as checkSystemAdmin } from '@/utils/sessionScope';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

export function SettingsPage() {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const { user } = useAuth();
  const workspace = useWorkspace();
  const { theme, setTheme } = useTheme();
  const { addToast } = useNotification();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const [aiSettings, setAiSettings] = useState(() => aiSettingsStore.get());

  const isSystemAdmin = checkSystemAdmin(user) || workspace.accountType === 'system_admin';

  const visibleTabs = useMemo(
    () => filterSettingsNavItems(SETTINGS_NAV_ITEMS, can, workspace.role, isSystemAdmin),
    [can, workspace.role, isSystemAdmin],
  );

  useEffect(() => {
    if (tabFromUrl === 'persona') return;
    if (!tabFromUrl && visibleTabs[0]) {
      navigate(settingsTabPath(visibleTabs[0].id), { replace: true });
      return;
    }
    if (tabFromUrl && !visibleTabs.some((tab) => tab.id === tabFromUrl) && visibleTabs[0]) {
      navigate(settingsTabPath(visibleTabs[0].id), { replace: true });
    }
  }, [tabFromUrl, visibleTabs, navigate]);

  if (tabFromUrl === 'persona') {
    return <Navigate to="/persona" replace />;
  }

  const activeTab = visibleTabs.some((tab) => tab.id === tabFromUrl)
    ? (tabFromUrl as string)
    : (visibleTabs[0]?.id ?? 'perfil');

  const handleSaveOpenAi = () => {
    aiSettingsStore.save(aiSettings);
    addToast({
      title: 'Preferências OpenAI salvas',
      message: 'Em produção o Assistente ChatBô usa OPENAI_API_KEY do Render (backend).',
      type: 'success',
    });
  };

  const activeLabel = visibleTabs.find((tab) => tab.id === activeTab)?.label ?? 'Configurações';
  const canManageCompany = ['owner', 'admin'].includes(workspace.role) || can('manageUsers');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Configurações
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {canManageCompany
              ? 'Use o submenu Configurações na barra lateral. A Persona do agente fica em Agente.'
              : 'Preferências pessoais da sua conta. Gestão da empresa fica restrita a administradores.'}
          </p>
        </div>
        <div className="sm:w-64 lg:hidden">
          <Select
            label="Seção"
            options={visibleTabs.map((tab) => ({ value: tab.id, label: tab.label }))}
            value={activeTab}
            onChange={(e) => navigate(settingsTabPath(e.target.value))}
          />
        </div>
      </div>

      <Card title={activeLabel}>
        {activeTab === 'perfil' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">{user?.name ?? 'Usuário'}</Badge>
              <Badge variant="default">{workspace.role}</Badge>
            </div>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <Button variant="outline" onClick={() => navigate('/perfil')}>
              Abrir meu perfil
            </Button>
          </div>
        )}
        {activeTab === 'preferencias' && (
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>Workspace: <strong>{workspace.name ?? 'legacy'}</strong></p>
            <p>Tipo de conta: <strong>{workspace.accountType}</strong></p>
          </div>
        )}
        {activeTab === 'empresa' && <CompanySettingsPanel />}
        {activeTab === 'usuarios' && <UsersSettingsPanel />}
        {activeTab === 'permissoes' && <PermissionsSettingsPanel />}
        {activeTab === 'fontes' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Canais e fontes conectadas ficam nas páginas operacionais existentes.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate('/canais')}>
                Abrir canais
              </Button>
              <Button variant="outline" onClick={() => navigate(settingsTabPath('mercos'))}>
                Atualização de catálogo
              </Button>
            </div>
          </div>
        )}
        {activeTab === 'integracoes' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Gerencie integrações conectadas na página dedicada.</p>
            <Button variant="outline" onClick={() => navigate('/integracoes')}>
              Abrir integrações
            </Button>
          </div>
        )}
        {activeTab === 'mercos' && <MercosSettingsPanel />}
        {activeTab === 'sistema' && <SystemStatusPanel />}
        {activeTab === 'openai' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
              <Badge variant={aiSettings.enabled && aiSettings.apiKey.startsWith('sk-') ? 'success' : 'default'}>
                {aiSettings.enabled && aiSettings.apiKey.startsWith('sk-') ? 'OpenAI local' : 'Backend Render'}
              </Badge>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Em produção o Assistente ChatBô usa a chave configurada no Render, não esta tela.
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={aiSettings.enabled}
                onChange={(e) => setAiSettings({ ...aiSettings, enabled: e.target.checked })}
                className="rounded border-gray-300"
              />
              Ativar OpenAI local (dev / fallback)
            </label>
            <Input
              label="API Key"
              type="password"
              placeholder="sk-..."
              value={aiSettings.apiKey}
              onChange={(e) => setAiSettings({ ...aiSettings, apiKey: e.target.value })}
            />
            <Select
              label="Modelo"
              options={[
                { value: 'gpt-4o', label: 'GPT-4o' },
                { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
              ]}
              value={aiSettings.model}
              onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
            />
            <div className="flex justify-end">
              <Button onClick={handleSaveOpenAi}>Salvar OpenAI local</Button>
            </div>
          </div>
        )}
        {activeTab === 'whatsapp' && <WhatsAppSettingsPanel />}
        {activeTab === 'notificacoes' && <NotificationsSettingsPanel />}
        {activeTab === 'seguranca' && <SecuritySettingsPanel />}
        {activeTab === 'tema' && (
          <div className="space-y-4">
            <Select
              label="Tema"
              options={[
                { value: 'light', label: 'Claro' },
                { value: 'dark', label: 'Escuro' },
              ]}
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            />
            <p className="text-xs text-gray-500">Tema salvo no navegador (localStorage).</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
