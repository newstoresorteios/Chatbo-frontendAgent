import { useCallback, useEffect, useRef, useState } from 'react';
import { playInboxChime } from '@/utils/inboxSound';

export function useInboxSound() {
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState('');
  const context = useRef<AudioContext | null>(null);
  const lastPlayed = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      void context.current?.close().catch(() => {});
      context.current = null;
    };
  }, []);
  const toggle = useCallback(async () => {
    if (enabled) {
      setEnabled(false);
      return;
    }
    try {
      context.current ??= new AudioContext();
      await context.current.resume();
      if (!mounted.current) return;
      if (context.current?.state !== 'running') throw new Error('Audio blocked');
      setEnabled(true);
      setError('');
      playInboxChime(context.current); // Preview also unlocks audio via explicit gesture.
      lastPlayed.current = Date.now();
    } catch {
      if (mounted.current) setError('Não foi possível ativar o som neste navegador.');
    }
  }, [enabled]);
  const notify = useCallback(() => {
    if (!enabled || !context.current || Date.now() - lastPlayed.current < 2_000) return;
    playInboxChime(context.current);
    lastPlayed.current = Date.now();
  }, [enabled]);
  return { enabled, error, toggle, notify };
}
