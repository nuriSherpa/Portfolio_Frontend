// src/components/blog/blog-filters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { X, Filter, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';

interface BlogFiltersProps {
  initialFilters: {
    categories: Array<{ name: string; slug: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
    sortOptions: string[];
  };
}

const DATE_RANGES = [
  { value: '', label: 'All Time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: '1y', label: 'Last year' },
];

const READING_TIMES = [
  { value: '', label: 'Any length' },
  { value: '1', label: '1 min read' },
  { value: '3', label: '3 min read' },
  { value: '5', label: '5 min read' },
  { value: '10', label: '10+ min read' },
];

// Local cache key
const FILTERS_CACHE_KEY = 'blog-filters-cache';

export function BlogFilters({ initialFilters }: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [panelOpen, setPanelOpen] = useState(false);

  // Cached filters — seed from initialFilters, persist to localStorage
  const [cachedFilters, setCachedFilters] = useState(initialFilters);

  // On mount: try to load from localStorage, fall back to initialFilters
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FILTERS_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only use cached if it has data
        if (parsed?.categories?.length || parsed?.tags?.length) {
          setCachedFilters(parsed);
        }
      }
    } catch (_) {}
  }, []);

  // When initialFilters change (fresh SSR data), update cache
  useEffect(() => {
    if (initialFilters?.categories?.length || initialFilters?.tags?.length) {
      setCachedFilters(initialFilters);
      try {
        localStorage.setItem(FILTERS_CACHE_KEY, JSON.stringify(initialFilters));
      } catch (_) {}
    }
  }, [initialFilters]);

  // Read URL params
  const urlCategory = searchParams.get('category') || '';
  const urlTagsRaw = searchParams.get('tags') || '';
  const urlTags = urlTagsRaw ? urlTagsRaw.split(',').filter(Boolean) : [];
  const urlSort = searchParams.get('sort') || 'newest';
  const urlDateRange = searchParams.get('dateRange') || '';
  const urlMinReadingTime = searchParams.get('minReadingTime') || '';
  const urlMaxReadingTime = searchParams.get('maxReadingTime') || '';

  const categories = cachedFilters?.categories || [];
  const allTags = cachedFilters?.tags || [];
  const sortOptions = cachedFilters?.sortOptions?.length
    ? cachedFilters.sortOptions
    : ['newest', 'oldest', 'popular', 'a-z', 'z-a'];

  // Active filter count (excluding category shown in pills, excluding sort)
  const activeFilterCount = [urlTagsRaw, urlDateRange, urlMinReadingTime].filter(Boolean).length;
  const hasActiveFilters = !!(
    urlCategory ||
    urlTagsRaw ||
    urlDateRange ||
    urlMinReadingTime ||
    urlMaxReadingTime
  );

  // ── URL helper ──
  const push = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete('page');
    router.push(`/blog?${params.toString()}`, { scroll: false });
  };

  // ── Category — single select, toggles off if clicked again ──
  const handleCategoryClick = (slug: string | null) => {
    // If clicking the already-active category, deselect it
    if (slug && slug === urlCategory) {
      push({ category: null, tags: null }); // also clear tags when deselecting category
    } else {
      push({ category: slug, tags: null }); // clear tags when switching category
    }
  };

  // ── Tags — multi select ──
  const handleTagToggle = (tagName: string) => {
    const current = new Set(urlTags);
    if (current.has(tagName)) current.delete(tagName);
    else current.add(tagName);
    const joined = Array.from(current).join(',');
    push({ tags: joined || null });
  };

  // ── Date range ──
  const handleDateRangeChange = (value: string) => {
    if (!value) {
      push({ dateRange: null, fromDate: null, toDate: null });
      return;
    }
    const now = new Date();
    let from: Date | null = null;
    switch (value) {
      case '7d':
        from = new Date(now.getTime() - 7 * 86400000);
        break;
      case '30d':
        from = new Date(now.getTime() - 30 * 86400000);
        break;
      case '90d':
        from = new Date(now.getTime() - 90 * 86400000);
        break;
      case '1y':
        from = new Date(now.getTime() - 365 * 86400000);
        break;
    }
    push({
      dateRange: value,
      fromDate: from ? from.toISOString() : null,
      toDate: now.toISOString(),
    });
  };

  // ── Clear all ──
  const clearAll = () => {
    const params = new URLSearchParams();
    if (urlSort && urlSort !== 'newest') params.set('sort', urlSort);
    router.push(`/blog${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
    setPanelOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* ── Row 1: Category pills — always visible ── */}
      <div className="flex flex-wrap gap-2">
        {/* All Posts */}
        <button
          onClick={() => handleCategoryClick(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ${
            !urlCategory
              ? 'bg-red text-white'
              : 'bg-grey-100 text-grey-600 hover:bg-red hover:text-white'
          }`}
        >
          All Posts
        </button>

        {/* Category pills */}
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => handleCategoryClick(cat.slug)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ${
              urlCategory === cat.slug
                ? 'bg-red text-white'
                : 'bg-grey-100 text-grey-600 hover:bg-red hover:text-white'
            }`}
          >
            {cat.name}
            {cat.count > 0 && (
              <span
                className={`ml-1.5 text-xs ${urlCategory === cat.slug ? 'opacity-75' : 'opacity-50'}`}
              >
                {cat.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Row 2: Filter toggle + active chips ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filter toggle */}
        <button
          onClick={() => setPanelOpen((o) => !o)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
            activeFilterCount > 0
              ? 'bg-red text-white border-red'
              : 'bg-white text-grey-700 border-grey-200 hover:border-red hover:text-red'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">{activeFilterCount}</span>
          )}
          {panelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Active tag chips */}
        {urlTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red/10 text-red border border-red/20 text-sm"
          >
            <span className="font-medium">#{tag}</span>
            <button
              onClick={() => handleTagToggle(tag)}
              className="ml-1 p-0.5 hover:bg-red/20 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}

        {/* Active date chip */}
        {urlDateRange && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red/10 text-red border border-red/20 text-sm">
            <Calendar className="w-3.5 h-3.5" />
            <span className="font-medium">
              {DATE_RANGES.find((d) => d.value === urlDateRange)?.label}
            </span>
            <button
              onClick={() => push({ dateRange: null, fromDate: null, toDate: null })}
              className="ml-1 p-0.5 hover:bg-red/20 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}

        {/* Active reading time chip */}
        {(urlMinReadingTime || urlMaxReadingTime) && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red/10 text-red border border-red/20 text-sm">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium">
              {urlMinReadingTime || '0'}–{urlMaxReadingTime || '∞'} min
            </span>
            <button
              onClick={() => push({ minReadingTime: null, maxReadingTime: null })}
              className="ml-1 p-0.5 hover:bg-red/20 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-sm text-grey-400 hover:text-red transition-colors underline ml-1"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Filter panel ── */}
      {panelOpen && (
        <div className="p-5 bg-white border border-grey-200 rounded-xl shadow-sm space-y-5">
          {/* Tags — show all tags, or filtered by category if one is active */}
          {allTags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-grey-500 mb-2">
                Tags
                {urlCategory && (
                  <span className="ml-1 text-grey-400 font-normal">
                    — filtered by {categories.find((c) => c.slug === urlCategory)?.name}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const active = urlTags.includes(tag.name);
                  return (
                    <button
                      key={tag.name}
                      onClick={() => handleTagToggle(tag.name)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ${
                        active
                          ? 'bg-red text-white'
                          : 'bg-grey-100 text-grey-600 hover:bg-red/10 hover:text-red'
                      }`}
                    >
                      #{tag.name}
                      {tag.count > 0 && (
                        <span className={`ml-1.5 text-xs ${active ? 'opacity-75' : 'opacity-50'}`}>
                          {tag.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date range + Reading time + Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-grey-500 flex items-center gap-1 mb-1.5">
                <Calendar className="w-3 h-3" /> Date Range
              </label>
              <select
                value={urlDateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-grey-200 rounded-lg bg-white focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
              >
                {DATE_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-grey-500 flex items-center gap-1 mb-1.5">
                <Clock className="w-3 h-3" /> Reading Time
              </label>
              <select
                value={urlMinReadingTime}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) push({ minReadingTime: null, maxReadingTime: null });
                  else push({ minReadingTime: v, maxReadingTime: (parseInt(v) + 2).toString() });
                }}
                className="w-full px-3 py-2 text-sm border border-grey-200 rounded-lg bg-white focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20"
              >
                {READING_TIMES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-grey-500 mb-1.5 block">Sort By</label>
              <select
                value={urlSort}
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

          <div className="flex justify-end gap-2 pt-1 border-t border-grey-100">
            <button
              onClick={() => setPanelOpen(false)}
              className="px-4 py-2 text-sm text-grey-600 hover:text-grey-900 transition-colors"
            >
              Close
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="px-4 py-2 text-sm bg-red text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
