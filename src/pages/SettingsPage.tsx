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
import { usePermissions } from '@/hooks/usePermissions';
import { aiSettingsStore } from '@/store/aiSettingsStore';
import { motion } from 'framer-motion';
import {
  Bell,
  Building2,
  DatabaseZap,
  IdCard,
  Key,
  Link,
  MessageCircle,
  Palette,
  Server,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface SettingsTab {
  id: string;
  label: string;
  group: 'workspace' | 'company' | 'integrations' | 'system';
  icon: ComponentType<{ className?: string }>;
}

const GROUP_LABELS: Record<SettingsTab['group'], string> = {
  workspace: 'Workspace',
  company: 'Empresa',
  integrations: 'Canais e dados',
  system: 'Sistema global',
};

export function SettingsPage() {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(() => tabFromUrl ?? 'perfil');
  const { user } = useAuth();
  const workspace = useWorkspace();
  const { theme, setTheme } = useTheme();
  const { addToast } = useNotification();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const [aiSettings, setAiSettings] = useState(() => aiSettingsStore.get());

  const canManageCompany = ['owner', 'admin'].includes(workspace.role) || can('manageUsers');
  const canManageIntegrations = can('manageIntegrations');
  const isSystemAdmin = workspace.accountType === 'system_admin';

  const visibleTabs = useMemo<SettingsTab[]>(() => {
    const tabs: SettingsTab[] = [
      { id: 'perfil', label: 'Meu perfil', group: 'workspace', icon: IdCard },
      { id: 'preferencias', label: 'Preferências', group: 'workspace', icon: SlidersHorizontal },
      { id: 'notificacoes', label: 'Notificações', group: 'workspace', icon: Bell },
      { id: 'seguranca', label: 'Segurança', group: 'workspace', icon: Key },
      { id: 'tema', label: 'Aparência', group: 'workspace', icon: Palette },
    ];

    if (canManageCompany) {
      tabs.push(
        { id: 'empresa', label: 'Minha empresa', group: 'company', icon: Building2 },
        { id: 'usuarios', label: 'Equipe e acessos', group: 'company', icon: Users },
        { id: 'permissoes', label: 'Permissões', group: 'company', icon: Shield },
      );
    }

    if (canManageIntegrations) {
      tabs.push(
        { id: 'fontes', label: 'Canais e fontes de dados', group: 'integrations', icon: DatabaseZap },
        { id: 'integracoes', label: 'Integrações', group: 'integrations', icon: Link },
        { id: 'mercos', label: 'Atualização de catálogo', group: 'integrations', icon: Settings },
      );
    }

    if (isSystemAdmin) {
      tabs.push(
        { id: 'sistema', label: 'Status técnico do sistema', group: 'system', icon: Server },
        { id: 'openai', label: 'Configuração OpenAI', group: 'system', icon: Sparkles },
        { id: 'whatsapp', label: 'Credenciais brutas do WhatsApp', group: 'system', icon: MessageCircle },
      );
    }

    return tabs;
  }, [canManageCompany, canManageIntegrations, isSystemAdmin]);

  useEffect(() => {
    if (tabFromUrl && visibleTabs.some((tab) => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, visibleTabs]);

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.id === activeTab) && visibleTabs[0]) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [activeTab, visibleTabs]);

  const handleSaveOpenAi = () => {
    aiSettingsStore.save(aiSettings);
    addToast({
      title: 'Preferências OpenAI salvas',
      message: 'Em produção o Assistente ChatBô usa OPENAI_API_KEY do Render (backend).',
      type: 'success',
    });
  };

  const activeLabel = visibleTabs.find((tab) => tab.id === activeTab)?.label ?? 'Configurações';
  const groups = Object.entries(GROUP_LABELS) as Array<[SettingsTab['group'], string]>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Configurações</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Preferências pessoais, equipe, fontes comerciais e controles técnicos conforme seu acesso.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex gap-2 overflow-x-auto lg:w-64 lg:flex-col lg:gap-4">
          {groups.map(([group, label]) => {
            const items = visibleTabs.filter((tab) => tab.group === group);
            if (items.length === 0) return null;

            return (
              <div key={group} className="flex gap-2 lg:flex-col lg:gap-1">
                <p className="hidden px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400 lg:block">
                  {label}
                </p>
                {items.map(({ id, label: tabLabel, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      activeTab === id
                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/40'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tabLabel}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="flex-1">
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
                <p>Onboarding: <strong>{workspace.onboardingStatus}</strong></p>
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
                  <Button variant="outline" onClick={() => setActiveTab('mercos')}>
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
        </div>
      </div>
    </motion.div>
  );
}
