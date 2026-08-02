import { MercosSettingsPanel } from '@/components/settings/MercosSettingsPanel';
import { motion } from 'framer-motion';

export function MercosPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mercos</h1>
        <p className="text-gray-500 dark:text-gray-400">Integração com a plataforma Mercos</p>
      </div>
      <MercosSettingsPanel />
    </motion.div>
  );
}
