// src/components/blog/blog-filters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { X, Filter, Calendar, Clock, User, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useState } from 'react';

interface FiltersProps {
  initialFilters: {
    categories: Array<{ name: string; slug: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
    authors?: Array<{ name: string; slug: string }>;
    sortOptions: string[];
  };
}

// Date range presets
const DATE_RANGES = [
  { value: '', label: 'All Time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: '1y', label: 'Last year' },
];

// Reading time presets
const READING_TIMES = [
  { value: '', label: 'Any length' },
  { value: '1', label: '1 min read' },
  { value: '3', label: '3 min read' },
  { value: '5', label: '5 min read' },
  { value: '10', label: '10+ min read' },
];

export function BlogFilters({ initialFilters }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Get all current filter values
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'newest';
  const author = searchParams.get('author') || '';
  const dateRange = searchParams.get('dateRange') || '';
  const minReadingTime = searchParams.get('minReadingTime') || '';
  const maxReadingTime = searchParams.get('maxReadingTime') || '';
  const fromDate = searchParams.get('fromDate') || '';
  const toDate = searchParams.get('toDate') || '';

  // Count active filters (excluding sort and search query)
  const activeFilterCount = [
    category,
    tag,
    author,
    dateRange,
    minReadingTime,
    maxReadingTime,
    fromDate,
    toDate,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  // Update URL helper
  const push = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== '') params.set(key, value);
      else params.delete(key);
    });
    params.delete('page'); // Reset to page 1 on filter change
    router.push(`/blog?${params.toString()}`, { scroll: false });
  };

  // Clear all filters
  const clearAll = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query); // Keep search query
    if (sort && sort !== 'newest') params.set('sort', sort); // Keep sort preference
    router.push(`/blog${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
    setIsOpen(false);
  };

  // Clear individual filter
  const clearFilter = (key: string) => {
    push({ [key]: null });
  };

  // Handle date range selection
  const handleDateRangeChange = (value: string) => {
    if (!value) {
      push({ dateRange: null, fromDate: null, toDate: null });
      return;
    }

    const now = new Date();
    let from: Date | null = null;
    let to: Date | null = now;

    switch (value) {
      case '7d':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    push({
      dateRange: value,
      fromDate: from ? from.toISOString() : null,
      toDate: to ? to.toISOString() : null,
    });
  };

  // Safely get sort options with fallback
  const sortOptions = initialFilters.sortOptions?.length
    ? initialFilters.sortOptions
    : ['newest', 'oldest', 'popular', 'relevance'];

  // Safely check if authors exist and have items
  const hasAuthors = initialFilters.authors && initialFilters.authors.length > 0;

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
            hasActiveFilters
              ? 'bg-red text-white border-red hover:bg-red-700'
              : 'bg-white text-grey-700 border-grey-200 hover:border-red hover:text-red'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">
            Filters
            {hasActiveFilters && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                {activeFilterCount}
              </span>
            )}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Active Filter Pills (shown when dropdown closed but filters active) */}
        {!isOpen && hasActiveFilters && (
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            {category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                {category}
                <button onClick={() => clearFilter('category')} className="hover:text-blue-800">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {tag && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-green-50 text-green-600 border border-green-200">
                #{tag}
                <button onClick={() => clearFilter('tag')} className="hover:text-green-800">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {author && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                <User className="w-3 h-3" />
                {author}
                <button onClick={() => clearFilter('author')} className="hover:text-purple-800">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {dateRange && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                <Calendar className="w-3 h-3" />
                {DATE_RANGES.find((d) => d.value === dateRange)?.label || dateRange}
                <button onClick={() => clearFilter('dateRange')} className="hover:text-orange-800">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(minReadingTime || maxReadingTime) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-teal-50 text-teal-600 border border-teal-200">
                <Clock className="w-3 h-3" />
                {minReadingTime || '0'}-{maxReadingTime || '∞'} min
                <button
                  onClick={() => {
                    push({ minReadingTime: null, maxReadingTime: null });
                  }}
                  className="hover:text-teal-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Clear All (when filters active) */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-sm text-grey-500 hover:text-red transition-colors underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-grey-200 rounded-xl shadow-lg z-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Input (if not already shown elsewhere) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-grey-500 flex items-center gap-1">
                <Search className="w-3 h-3" />
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  readOnly
                  placeholder="Use search box above"
                  className="w-full px-3 py-2 text-sm border border-grey-200 rounded-lg bg-grey-50 text-grey-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Category Filter */}
            {(initialFilters.categories ?? []).length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-grey-500">Category</label>
                <select
                  value={category}
                  onChange={(e) => push({ category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-grey-200 rounded-lg bg-white focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                >
                  <option value="">All categories</option>
                  {initialFilters.categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name} ({c.count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tag Filter */}
            {(initialFilters.tags ?? []).length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-grey-500">Tag</label>
                <select
                  value={tag}
                  onChange={(e) => push({ tag: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-grey-200 rounded-lg bg-white focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                >
                  <option value="">All tags</option>
                  {initialFilters.tags.map((t) => (
                    <option key={t.name} value={t.name}>
                      #{t.name} ({t.count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Author Filter - FIXED with proper optional check */}
            {hasAuthors && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-grey-500 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Author
                </label>
                <select
                  value={author}
                  onChange={(e) => push({ author: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-grey-200 rounded-lg bg-white focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
                >
                  <option value="">All authors</option>
                  {initialFilters.authors!.map((a) => (
                    <option key={a.slug} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-grey-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-grey-200 rounded-lg bg-white focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
              >
                {DATE_RANGES.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reading Time Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-grey-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Reading Time
              </label>
              <select
                value={minReadingTime}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) {
                    push({ minReadingTime: null, maxReadingTime: null });
                  } else {
                    const min = parseInt(value);
                    push({
                      minReadingTime: value,
                      maxReadingTime: (min + 2).toString(), // Approximate range
                    });
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-grey-200 rounded-lg bg-white focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
              >
                {READING_TIMES.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-grey-500">Sort By</label>
              <select
                value={sort}
                onChange={(e) => push({ sort: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-grey-200 rounded-lg bg-white focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
              >
                {sortOptions.map((o) => (
                  <option key={o} value={o}>
                    {o.charAt(0).toUpperCase() + o.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dropdown Footer */}
          <div className="mt-4 pt-4 border-t border-grey-200 flex items-center justify-between">
            <span className="text-sm text-grey-500">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-grey-600 hover:text-grey-900 transition-colors"
              >
                Close
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-sm bg-red text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
