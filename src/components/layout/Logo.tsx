import { cn } from '@/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showCompany?: boolean;
  full?: boolean;
  className?: string;
}

const sizes = {
  sm: { symbol: 'h-8 w-8', text: 'text-[17px]', sub: 'text-[9px]', full: 'max-h-10 w-auto max-w-[180px]' },
  md: { symbol: 'h-9 w-9', text: 'text-xl', sub: 'text-[10px]', full: 'max-h-16 w-auto max-w-[240px]' },
  lg: { symbol: 'h-11 w-11', text: 'text-2xl', sub: 'text-xs', full: 'max-h-24 w-auto max-w-[320px]' },
};

export function Logo({ size = 'md', showText = true, showCompany = false, full = false, className }: LogoProps) {
  const s = sizes[size];

  if (full) {
    return (
      <img
        src="/branding/chatbo-logo-oficial.png"
        alt="ChatBô by Tironi Tech"
        className={cn('block object-contain object-left', s.full, className)}
      />
    );
  }

  return (
    <div className={cn('flex items-center gap-2.5 leading-none', className)}>
      <img
        src="/branding/chatbo-simbolo-oficial.png"
        alt={showText ? '' : 'Símbolo do ChatBô'}
        aria-hidden={showText}
        className={cn('block shrink-0 object-contain', s.symbol)}
      />
      {showText && (
        <div className="flex flex-col justify-center">
          <span className={cn('font-display font-black tracking-[0.02em] text-gray-950 dark:text-slate-50', s.text)}>
            ChatBô
          </span>
          {showCompany && (
            <p className={cn('mt-0.5 font-semibold tracking-[0.08em] text-gray-500 dark:text-slate-300', s.sub)}>by Tironi Tech</p>
          )}
        </div>
      )}
    </div>
  );
}
