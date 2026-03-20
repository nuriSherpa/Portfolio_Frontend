'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BlogCard } from '@/components/blog/blog-card';
import { BlogCardSkeleton } from '@/components/blog/blog-card-skeleton';
import { Search, SlidersHorizontal, X, Calendar, TrendingUp, Tag } from 'lucide-react';
import Link from 'next/link';
import { searchPosts, SearchResults, PostFilters } from '@/lib/api/actions/blog';

// Helper type for dropdown options
interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

const DATE_RANGES = [
  { value: '', label: 'All Time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: '1y', label: 'Last year' },
];

const POPULARITY = [
  { value: '', label: 'Any views' },
  { value: '100', label: '100+ views' },
  { value: '500', label: '500+ views' },
  { value: '1000', label: '1,000+ views' },
];

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const tag = searchParams.get('tag') || '';
  const category = searchParams.get('category') || '';
  const dateRange = searchParams.get('dateRange') || '';
  const minViews = searchParams.get('minViews') || '';
  const sort = searchParams.get('sort') || 'relevance';

  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [availableTags, setAvailableTags] = useState<FilterOption[]>([]);
  const [availableCategories, setAvailableCategories] = useState<FilterOption[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const data = await searchPosts(query, {
          tag: tag || undefined,
          category: category || undefined,
          sort: sort || undefined,
          page: 1,
        });

        setResults(data);

        // Transform backend filters to dropdown format
        if (data.filters) {
          setAvailableCategories(
            data.filters.categories.map((c) => ({
              value: c.slug,
              label: c.name,
              count: c.count,
            })),
          );
          setAvailableTags(
            data.filters.tags.map((t) => ({
              value: t.name,
              label: t.name,
              count: t.count,
            })),
          );
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, tag, category, dateRange, minViews, sort]);

  const buildUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    return `/blog/search?${params.toString()}`;
  };

  const activeFiltersCount = [category, dateRange, minViews, tag].filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/blog" className="text-gray-500 hover:text-red-600 text-sm">
          ← Back to all posts
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Search className="w-8 h-8 text-red-600" />
          {query ? `Results for "${query}"` : tag ? `Posts tagged #${tag}` : 'All posts'}
        </h1>
        {!isLoading && results && (
          <p className="text-gray-600">
            Found {results.meta.total} post{results.meta.total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="mb-6 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            defaultValue={query}
            placeholder="Search within results..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-red-600 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value;
                window.location.href = buildUrl({ q: value });
              }
            }}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${
            showFilters || activeFiltersCount > 0
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-gray-700 border-gray-200'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category</label>
              <select
                value={category}
                onChange={(e) => (window.location.href = buildUrl({ category: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
              >
                <option value="">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} {cat.count ? `(${cat.count})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Tag className="w-3.5 h-3.5" /> Tag
              </label>
              <select
                value={tag}
                onChange={(e) => (window.location.href = buildUrl({ tag: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
              >
                <option value="">All Tags</option>
                {availableTags.map((t) => (
                  <option key={t.value} value={t.value}>
                    #{t.label} {t.count ? `(${t.count})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => (window.location.href = buildUrl({ dateRange: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
              >
                {DATE_RANGES.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Minimum Views
              </label>
              <select
                value={minViews}
                onChange={(e) => (window.location.href = buildUrl({ minViews: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
              >
                {POPULARITY.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="flex gap-2">
                {results?.filters.sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => (window.location.href = buildUrl({ sort: option }))}
                    className={`px-3 py-1.5 text-sm rounded-md ${
                      sort === option
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <Link
                href={`/blog/search?${query ? `q=${query}` : ''}${tag ? `&tag=${tag}` : ''}`}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600"
              >
                <X className="w-4 h-4" />
                Clear filters
              </Link>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      ) : results?.posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {results?.posts.map((post) => (
            <BlogCard key={post.id || post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8">Loading...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
