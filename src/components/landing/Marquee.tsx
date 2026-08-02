import type { ReactNode } from 'react';
import { cn } from '@/utils';

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
}

export function Marquee({ children, className, duration = 32, reverse = false }: MarqueeProps) {
  return (
    <div
      className={cn(
        'group relative flex overflow-hidden',
        '[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]',
        className
      )}
    >
      <div
        className="flex shrink-0 items-center gap-4 [animation-play-state:running] group-hover:[animation-play-state:paused]"
        style={{ animation: `marquee-scroll ${duration}s linear infinite ${reverse ? 'reverse' : ''}` }}
      >
        {children}
      </div>
      <div
        aria-hidden
        className="flex shrink-0 items-center gap-4 [animation-play-state:running] group-hover:[animation-play-state:paused]"
        style={{ animation: `marquee-scroll ${duration}s linear infinite ${reverse ? 'reverse' : ''}` }}
      >
        {children}
      </div>
    </div>
  );
}
