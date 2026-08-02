import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils';
import { FlaskConical } from 'lucide-react';

export type DemoNoticeVariant = 'memory' | 'ai' | 'sandbox' | 'mock' | 'comingSoon';

const copy: Record<DemoNoticeVariant, string> = {
  memory:
    'Módulo em Beta — alterações são demonstrativas e não persistem após reiniciar o servidor.',
  ai: 'Assistente ChatBô em Beta — sugestões usam dados de demonstração até integração completa com sua base.',
  sandbox:
    'Integração Mercos em sandbox — dados de teste até o ambiente de produção estar disponível.',
  mock: 'Conteúdo demonstrativo — esta seção ainda não está conectada aos dados reais da sua conta.',
  comingSoon:
    'Alguns itens abaixo ainda não estão disponíveis — estão marcados como Em breve. O que está ativo hoje funciona de verdade.',
};

interface DemoNoticeProps {
  variant?: DemoNoticeVariant;
  className?: string;
}

export function DemoNotice({ variant = 'memory', className }: DemoNoticeProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-100',
        className,
      )}
      role="status"
    >
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <p>{copy[variant]}</p>
    </div>
  );
}

export function PageBetaBadge() {
  return (
    <Badge variant="warning" className="align-middle text-[10px] uppercase tracking-wide">
      Beta
    </Badge>
  );
}

export function ComingSoonBadge({ className }: { className?: string }) {
  return (
    <Badge variant="default" className={cn('text-[10px] uppercase tracking-wide', className)}>
      Em breve
    </Badge>
  );
}
