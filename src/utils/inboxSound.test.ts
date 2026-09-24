import { describe, expect, it, vi } from 'vitest';
import { shouldSound, playInboxChime } from './inboxSound';

describe('incoming sound', () => {
  const initial = { cursor: 'boot:0', at: 0 };
  const next = { cursor: 'boot:1', at: 100_000 };
  it('does not ring on first load, repeated updates, restart or old history', () => {
    expect(shouldSound(undefined, next, 100_100)).toBe(false);
    expect(shouldSound(next, next, 100_100)).toBe(false);
    expect(shouldSound(initial, undefined, 100_100)).toBe(false);
    expect(shouldSound(initial, { ...next, cursor: 'restart:1' }, 100_100)).toBe(false);
    expect(shouldSound(initial, next, 120_000)).toBe(false);
    expect(shouldSound(initial, { ...next, at: NaN }, 100_100)).toBe(false);
  });
  it('rings for a new recent inbound event', () => {
    expect(shouldSound(initial, next, 100_100)).toBe(true);
  });
  it('schedules three soft notes and skips suspended audio', () => {
    const oscillators: { start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }[] = [];
    const context = {
      state: 'running', currentTime: 10, destination: {},
      createOscillator: vi.fn(() => {
        const oscillator = { frequency: { value: 0 }, connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn() };
        oscillators.push(oscillator);
        return oscillator;
      }),
      createGain: () => ({ gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() }),
    };
    playInboxChime(context as unknown as AudioContext);
    expect(oscillators).toHaveLength(3);
    expect(oscillators[0].start).toHaveBeenCalledWith(10);
    expect(oscillators[2].stop).toHaveBeenCalledWith(10.28 + 0.32);
    context.state = 'suspended';
    playInboxChime(context as unknown as AudioContext);
    expect(oscillators).toHaveLength(3);
  });
});
