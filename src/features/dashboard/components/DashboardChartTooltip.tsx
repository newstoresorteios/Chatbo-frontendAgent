export function DashboardChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs shadow-lg dark:border-white/10 dark:bg-gray-900">
      <p className="mb-2 font-semibold text-gray-900 dark:text-white">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="flex items-center justify-between gap-6 text-gray-500">
          <span>{item.name}</span>
          <span className="font-semibold tabular-nums" style={{ color: item.color }}>
            {item.value}
          </span>
        </p>
      ))}
    </div>
  );
}
