// src/app/(public)/blog/search/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BlogCard } from '@/components/blog/blog-card';
import { BlogCardSkeleton } from '@/components/blog/blog-card-skeleton';
import { Search, X, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { searchPosts } from '@/lib/api/actions/blog';
import { BlogPost } from '@/lib/types/models';

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

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const tagsRaw = searchParams.get('tags') || '';
  const dateRange = searchParams.get('dateRange') || '';
  const minReadingTime = searchParams.get('minReadingTime') || '';
  const sort = searchParams.get('sort') || 'relevance';

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!query && !category && !tagsRaw) {
      router.replace('/blog');
      return;
    }

    const fetch = async () => {
      setIsLoading(true);
      try {
        const result = await searchPosts(query, {
          category: category || undefined,
          tags: tagsRaw || undefined,
          sort: sort || undefined,
          page: 1,
          limit: 20,
          minReadingTime: minReadingTime ? parseInt(minReadingTime) : undefined,
        });
        setPosts(result.posts || []);
        setTotal(result.meta?.total || 0);
      } catch (e) {
        console.error('Search error:', e);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [query, category, tagsRaw, dateRange, minReadingTime, sort, router]);

  const updateFilter = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/blog/search?${params.toString()}`, { scroll: false } as any);
  };

  const hasFilters = !!(category || tagsRaw || dateRange || minReadingTime);

  return (
    <main className="min-h-screen bg-white py-12">
      <div className="w-[80%] mx-auto">
        {/* Back */}
        <div className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-grey-500 hover:text-red text-sm transition-colors"
          >
            ← Back to Blog
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-grey-900 mb-1">
            {query
              ? `Results for "${query}"`
              : category
                ? `Category: ${category}`
                : tagsRaw
                  ? `Tag: #${tagsRaw}`
                  : 'Search'}
          </h1>
          {!isLoading && (
            <p className="text-grey-500 text-sm">
              {total} post{total !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {/* Date range */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-grey-400" />
            <select
              value={dateRange}
              onChange={(e) => updateFilter({ dateRange: e.target.value || null })}
              className="text-sm border border-grey-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-red"
            >
              {DATE_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reading time */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-grey-400" />
            <select
              value={minReadingTime}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) updateFilter({ minReadingTime: null, maxReadingTime: null });
                else
                  updateFilter({ minReadingTime: v, maxReadingTime: (parseInt(v) + 2).toString() });
              }}
              className="text-sm border border-grey-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-red"
            >
              {READING_TIMES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => updateFilter({ sort: e.target.value })}
            className="text-sm border border-grey-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-red ml-auto"
          >
            {['relevance', 'newest', 'oldest', 'popular'].map((o) => (
              <option key={o} value={o}>
                {o.charAt(0).toUpperCase() + o.slice(1)}
              </option>
            ))}
          </select>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={() =>
                updateFilter({
                  category: null,
                  tags: null,
                  dateRange: null,
                  minReadingTime: null,
                  maxReadingTime: null,
                })
              }
              className="inline-flex items-center gap-1 text-sm text-grey-400 hover:text-red transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-grey-50 rounded-2xl border border-grey-200">
            <Search className="w-12 h-12 text-grey-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-grey-900 mb-2">No posts found</h3>
            <p className="text-grey-500 mb-6">Try adjusting your search or filters.</p>
            <Link
              href="/blog"
              className="px-6 py-2 bg-red text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Browse all posts
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white py-12">
          <div className="w-[80%] mx-auto space-y-6">
            {[...Array(3)].map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        </main>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
