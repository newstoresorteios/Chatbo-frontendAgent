import { cn } from '@/utils';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import type { DashboardInternalNavProps, DashboardSelectOption } from '../types';

function CompactSelect({ ariaLabel, value, onChange, options, className }: { ariaLabel: string; value: string; onChange: (value: string) => void; options: DashboardSelectOption[]; className?: string }) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn('h-9 rounded-full border border-white/10 bg-white/[0.08] px-3 text-[13px] font-semibold text-slate-100 outline-none transition hover:bg-white/[0.12] focus:border-blue-400/60 [&>option]:bg-slate-900 [&>option]:text-white', className)}
    >
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
}

export function DashboardInternalNav(props: DashboardInternalNavProps) {
  const {
    items, activeSection, isHidden, presentationMode, filtersOpen, period, productFilter, customerFilter,
    statusFilter, channelFilter, periodOptions, productOptions, customerOptions, statusOptions, channelOptions,
    onPeriodChange, onProductChange, onCustomerChange, onStatusChange, onChannelChange, onToggleFilters,
  } = props;

  return (
    <div className={cn('sticky top-0 z-[40] -mx-4 transition-all duration-300 ease-out lg:-mx-6', isHidden ? 'pointer-events-none -translate-y-full opacity-0' : 'translate-y-0 opacity-100')}>
      <div className="border-b border-white/10 bg-slate-950/80 px-4 py-2.5 shadow-lg shadow-black/10 backdrop-blur-xl lg:px-6">
        <div className="rounded-2xl border border-white/10 bg-slate-950/75 p-2 shadow-lg shadow-black/10 backdrop-blur-xl">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <nav className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {items.map(({ label, id, icon: Icon }) => (
                <a key={id} href={`#${id}`} className={cn('inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 text-[13px] font-semibold transition-all', activeSection === id ? 'border-transparent bg-gradient-to-r from-blue-600 to-red-500 text-white shadow-md shadow-blue-950/20' : 'border-white/0 text-slate-300 hover:border-white/10 hover:bg-white/[0.08] hover:text-white')}>
                  <Icon className="h-4 w-4" /> {label}
                </a>
              ))}
            </nav>
            {!presentationMode && (
              <div className="flex shrink-0 items-center gap-2">
                <CompactSelect ariaLabel="Período" value={period} onChange={(value) => onPeriodChange(value as typeof period)} options={periodOptions} className="w-[118px]" />
                <div className="hidden items-center gap-2 lg:flex">
                  <CompactSelect ariaLabel="Produto" value={productFilter} onChange={onProductChange} options={productOptions} className="w-[150px]" />
                  <CompactSelect ariaLabel="Cliente" value={customerFilter} onChange={onCustomerChange} options={customerOptions} className="w-[150px]" />
                  <CompactSelect ariaLabel="Status comercial" value={statusFilter} onChange={(value) => onStatusChange(value as typeof statusFilter)} options={statusOptions} className="w-[140px]" />
                  <CompactSelect ariaLabel="Canal" value={channelFilter} onChange={onChannelChange} options={channelOptions} className="w-[140px]" />
                </div>
                <button type="button" onClick={onToggleFilters} className={cn('inline-flex h-9 items-center gap-2 rounded-full border border-white/10 px-3 text-[13px] font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white lg:hidden', filtersOpen && 'bg-white/[0.08] text-white')}>
                  <SlidersHorizontal className="h-4 w-4" /> Filtros
                </button>
              </div>
            )}
          </div>
          {!presentationMode && filtersOpen && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-2 grid gap-2 border-t border-white/10 pt-2 sm:grid-cols-2 lg:hidden">
              <CompactSelect ariaLabel="Produto" value={productFilter} onChange={onProductChange} options={productOptions} />
              <CompactSelect ariaLabel="Cliente" value={customerFilter} onChange={onCustomerChange} options={customerOptions} />
              <CompactSelect ariaLabel="Status comercial" value={statusFilter} onChange={(value) => onStatusChange(value as typeof statusFilter)} options={statusOptions} />
              <CompactSelect ariaLabel="Canal" value={channelFilter} onChange={onChannelChange} options={channelOptions} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
