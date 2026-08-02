import { Logo } from '@/components/layout/Logo';

export function RouteLoadingFallback() {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
      <Logo size="md" full className="max-w-[220px]" />
      <span>Carregando ChatBô...</span>
    </div>
  );
}

export function PageState({ error, empty }: { error?: string; empty?: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-center text-sm text-gray-500 dark:text-gray-400">
      <img src="/branding/chatbo-simbolo-oficial.png" alt="Símbolo do ChatBô" className="h-12 w-12 object-contain" />
      <span>{error ?? empty ?? 'Carregando ChatBô...'}</span>
    </div>
  );
}
