import type { ReactNode } from 'react';

export function DashboardDataTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white/90 shadow-sm dark:border-white/10 dark:bg-gray-900/90">
      <table className="min-w-full text-left text-[13px] sm:text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-white/[0.03]">
          <tr>
            {headers.map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/10">{children}</tbody>
      </table>
    </div>
  );
}
