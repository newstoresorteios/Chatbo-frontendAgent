import { useEffect, useRef, useState } from 'react';

type CounterFormat = 'number' | 'time';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  format?: CounterFormat;
  once?: boolean;
  className?: string;
}

const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3);

function formatTime(totalSeconds: number) {
  const roundedSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(roundedSeconds / 60);
  const seconds = roundedSeconds % 60;

  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function AnimatedCounter({
  value,
  duration = 1600,
  suffix = '',
  prefix = '',
  decimals = 0,
  format = 'number',
  once = true,
  className,
}: AnimatedCounterProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    const startAnimation = () => {
      if (once && hasAnimatedRef.current) return;

      hasAnimatedRef.current = true;
      const startedAt = performance.now();

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      const tick = (currentTime: number) => {
        const elapsed = currentTime - startedAt;
        const progress = Math.min(elapsed / duration, 1);
        const nextValue = value * easeOutCubic(progress);

        setDisplayValue(nextValue);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(tick);
        } else {
          setDisplayValue(value);
        }
      };

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === 'undefined') {
      startAnimation();
      return () => {
        if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startAnimation();
      },
      { threshold: 0.35 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [duration, once, value]);

  const formattedValue =
    format === 'time'
      ? formatTime(displayValue)
      : `${prefix}${displayValue.toFixed(decimals)}${suffix}`;

  return (
    <span
      ref={elementRef}
      className={className}
      aria-label={
        format === 'time'
          ? `${prefix}${formatTime(value)}${suffix}`
          : `${prefix}${value.toFixed(decimals)}${suffix}`
      }
    >
      {format === 'time' ? `${prefix}${formattedValue}${suffix}` : formattedValue}
    </span>
  );
}
