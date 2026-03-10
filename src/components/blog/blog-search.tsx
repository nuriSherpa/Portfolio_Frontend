'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface BlogSearchProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  isLoading?: boolean;
}

export function BlogSearch({ onSearch, initialValue = '', isLoading }: BlogSearchProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(value);
    },
    [value, onSearch],
  );

  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center">
        <Search
          className={`absolute left-4 w-5 h-5 ${isLoading ? 'text-red animate-pulse' : 'text-grey-400'}`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search articles..."
          className="w-full pl-12 pr-12 py-4 bg-grey-50 border border-grey-200 rounded-xl text-grey-900 placeholder:text-grey-400 focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-all"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 p-1 hover:bg-grey-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-grey-400" />
          </button>
        )}
      </div>
    </form>
  );
}
