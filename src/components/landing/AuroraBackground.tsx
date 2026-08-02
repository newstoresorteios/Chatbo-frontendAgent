import { motion } from 'framer-motion';
import { cn } from '@/utils';

interface AuroraBackgroundProps {
  className?: string;
  withGrid?: boolean;
}

export function AuroraBackground({ className, withGrid = true }: AuroraBackgroundProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <motion.div
        className="absolute -top-44 left-1/4 h-[520px] w-[520px] rounded-full bg-blue-600/24 blur-[120px]"
        animate={{ x: [0, 60, -20, 0], y: [0, 38, -26, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-12 right-0 h-[420px] w-[420px] rounded-full bg-red-500/16 blur-[110px]"
        animate={{ x: [0, -48, 28, 0], y: [0, 48, 8, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-sky-500/10 blur-[100px]"
        animate={{ x: [0, 38, -36, 0], y: [0, -28, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />

      {withGrid && (
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(96,165,250,0.42) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.22) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 60% 60% at 50% 0%, black 40%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 60% 60% at 50% 0%, black 40%, transparent 100%)',
          }}
        />
      )}

      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
