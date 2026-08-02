const COOLDOWN_MS = 30_000;
const STORAGE_KEY = 'pulsedesk_last_mercos_sync';

export function getMercosSyncCooldownRemainingMs(): number {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return 0;
  const last = Number(raw);
  if (!Number.isFinite(last)) return 0;
  const elapsed = Date.now() - last;
  return Math.max(0, COOLDOWN_MS - elapsed);
}

export function markMercosSyncCompleted(): void {
  localStorage.setItem(STORAGE_KEY, String(Date.now()));
}

export function formatCooldownSeconds(ms: number): number {
  return Math.ceil(ms / 1000);
}
