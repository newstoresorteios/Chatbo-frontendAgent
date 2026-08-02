import { cn } from '@/utils';
import { Search as SearchIcon } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onSearch?: (value: string) => void;
}

export function Search({ className, onSearch, onChange, ...props }: SearchProps) {
  return (
    <div className={cn('relative', className)}>
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        onChange={(e) => {
          onChange?.(e);
          onSearch?.(e.target.value);
        }}
        {...props}
      />
    </div>
  );
}
