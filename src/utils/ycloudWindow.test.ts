import { describe, expect, it } from 'vitest';
import { isYCloudTextWindowClosed } from './ycloudWindow';

const now = Date.parse('2026-10-23T12:00:00Z');

describe('isYCloudTextWindowClosed', () => {
  it('keeps other providers unchanged and fails closed when customer time is absent', () => {
    expect(isYCloudTextWindowClosed('meta', null, now)).toBe(false);
    expect(isYCloudTextWindowClosed('ycloud', null, now)).toBe(true);
    expect(isYCloudTextWindowClosed('ycloud', 'invalid', now)).toBe(true);
  });

  it('closes at exactly 24 hours and rejects future timestamps', () => {
    expect(isYCloudTextWindowClosed('ycloud', '2026-10-22T12:00:01Z', now)).toBe(false);
    expect(isYCloudTextWindowClosed('ycloud', '2026-10-22T12:00:00Z', now)).toBe(true);
    expect(isYCloudTextWindowClosed('ycloud', '2026-10-23T12:06:00Z', now)).toBe(true);
  });
});
