import { cn } from '@/utils';

export function CompactSelect({
  ariaLabel,
  value,
  onChange,
  options,
  className,
}: {
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'h-9 rounded-xl border border-white/10 bg-slate-900/80 px-3 text-[13px] font-medium text-slate-100 outline-none transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20',
        className,
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
