import { AgentAdvancedSettingsPanel } from '@/components/settings/AgentAdvancedSettingsPanel';
import { Loading } from '@/components/ui/EmptyState';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { motion } from 'framer-motion';

export function AgentAdvancedSettingsPage() {
  const workspace = useWorkspace();

  if (workspace.isLoading) return <Loading />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-300">Agente</p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Configuração avançada
        </h1>
        <p className="mt-2 max-w-3xl text-gray-500 dark:text-gray-400">
          Regras comerciais, mensagens, conhecimento e parâmetros usados pelo agente de {workspace.name || 'sua empresa'}.
          A persona é gerenciada na aba Persona do agente.
        </p>
      </div>
      <AgentAdvancedSettingsPanel key={`${workspace.id}:${workspace.user?.id}`} />
    </motion.div>
  );
}
