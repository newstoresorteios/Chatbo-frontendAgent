export function isYCloudTextWindowClosed(
  provider: string | null | undefined,
  lastCustomerMessageAt: string | null | undefined,
  now = Date.now(),
): boolean {
  if (provider !== 'ycloud') return false;
  if (!lastCustomerMessageAt) return true;
  const latest = Date.parse(lastCustomerMessageAt);
  return !Number.isFinite(latest) || latest > now + 5 * 60_000
    || now - latest >= 24 * 60 * 60_000;
}
