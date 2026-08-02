export function getGreeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function formatToday(now = new Date()): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);
}

export function daysSince(date?: string | null, now = Date.now()): number {
  if (!date) return 999;
  return Math.max(0, Math.floor((now - new Date(date).getTime()) / 86400000));
}

export function formatPercent(value: number): string {
  return `${Math.max(0, Math.round(value))}%`;
}
