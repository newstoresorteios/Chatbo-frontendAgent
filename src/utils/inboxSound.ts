export interface IncomingSignal { cursor: string; at: number }

export function shouldSound(previous: IncomingSignal | undefined, next: IncomingSignal | undefined, now: number) {
  return Boolean(previous && next && next.cursor !== previous.cursor
    && next.cursor.split(':')[0] === previous.cursor.split(':')[0]
    && Number.isFinite(next.at) && now - next.at >= -5_000 && now - next.at < 15_000);
}

/** Original soft three-note motif, synthesized locally; no social-network audio assets. */
export function playInboxChime(context: AudioContext) {
  if (context.state !== 'running') return;
  const start = context.currentTime;
  [523.25, 783.99, 659.25].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const at = start + index * 0.14;
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.065, at + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, at + 0.3);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(at);
    oscillator.stop(at + 0.32);
  });
}
