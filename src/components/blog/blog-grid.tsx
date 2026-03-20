// src/components/blog/blog-grid.tsx
'use client';

import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { X, Search, Filter, Calendar, Clock, User } from 'lucide-react';
import { BlogPost } from '@/lib/types/models';
import { BlogCard } from './blog-card';
import { BlogCardSkeleton } from './blog-card-skeleton';
import { BlogTags } from './blog-tags';
import { getPosts, searchPosts } from '@/lib/api/actions/blog';
import { ScrollToTopButton } from '../shared/scroll-to-top-button';
import { useSearchParams, useRouter } from 'next/navigation';

interface BlogGridProps {
  initialPosts: BlogPost[];
  initialMeta: {
    total: number;
    page: number;
    totalPages: number;
    showing: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  initialFilters: {
    categories: Array<{ name: string; slug: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
    sortOptions: string[];
  };
  limit: number;
}

const MemoizedBlogCard = memo(BlogCard);

// Filter chip component
const FilterChip = ({
  label,
  value,
  onRemove,
  icon: Icon,
}: {
  label: string;
  value: string;
  onRemove: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red/10 text-red border border-red/20 text-sm">
    {Icon && <Icon className="w-3.5 h-3.5" />}
    <span className="opacity-70">{label}:</span>
    <span className="font-medium truncate max-w-[150px]">{value}</span>
    <button
      onClick={onRemove}
      className="ml-1 p-0.5 hover:bg-red/20 rounded-full transition-colors"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </span>
);

export function BlogGrid({ initialPosts, initialMeta, initialFilters, limit }: BlogGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ============ ALL URL PARAMETERS ============
  const urlQ = searchParams.get('q') || '';
  const urlTag = searchParams.get('tag') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlAuthor = searchParams.get('author') || '';
  const urlSort = searchParams.get('sort') || 'newest';
  const urlFromDate = searchParams.get('fromDate') || '';
  const urlToDate = searchParams.get('toDate') || '';
  const urlMinReadingTime = searchParams.get('minReadingTime') || '';
  const urlMaxReadingTime = searchParams.get('maxReadingTime') || '';
  const urlDateRange = searchParams.get('dateRange') || '';

  // ============ STATE ============
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [currentPage, setCurrentPage] = useState(initialMeta?.page || 1);
  const [totalPages, setTotalPages] = useState(initialMeta?.totalPages || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [availableTags, setAvailableTags] = useState(initialFilters.tags || []);
  const [availableCategories, setAvailableCategories] = useState(initialFilters.categories || []);

  // ============ REFS ============
  const isFetchingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadedPagesRef = useRef<Set<number>>(new Set([1]));
  const prevFiltersRef = useRef({
    query: urlQ,
    tag: urlTag,
    category: urlCategory,
    author: urlAuthor,
    sort: urlSort,
    fromDate: urlFromDate,
    toDate: urlToDate,
    minReadingTime: urlMinReadingTime,
    maxReadingTime: urlMaxReadingTime,
    dateRange: urlDateRange,
  });

  // ============ CHECK ACTIVE FILTERS ============
  const hasActiveFilters =
    urlQ ||
    urlTag ||
    urlCategory ||
    urlAuthor ||
    urlFromDate ||
    urlToDate ||
    urlMinReadingTime ||
    urlMaxReadingTime;

  // ============ SYNC INITIAL DATA ============
  useEffect(() => {
    setPosts(initialPosts);
    setCurrentPage(initialMeta?.page || 1);
    setTotalPages(initialMeta?.totalPages || 1);
    setAvailableTags(initialFilters.tags || []);
    setAvailableCategories(initialFilters.categories || []);
    loadedPagesRef.current = new Set([initialMeta?.page || 1]);
  }, [initialPosts, initialMeta, initialFilters]);

  // ============ FETCH WITH ALL FILTERS ============
  const fetchWithParams = useCallback(
    async (page: number, append = false) => {
      if (!append && loadedPagesRef.current.has(page) && page === currentPage) {
        return;
      }

      if (append) {
        setIsLoading(true);
      } else {
        setIsFiltering(true);
      }

      try {
        // Use searchPosts for all filtering (supports all params)
        const result = await searchPosts(urlQ, {
          tag: urlTag || undefined,
          category: urlCategory || undefined,
          author: urlAuthor || undefined,
          sort: urlSort,
          page,
          limit,
          fromDate: urlFromDate || undefined,
          toDate: urlToDate || undefined,
          minReadingTime: urlMinReadingTime ? parseInt(urlMinReadingTime) : undefined,
          maxReadingTime: urlMaxReadingTime ? parseInt(urlMaxReadingTime) : undefined,
        });

        if (append) {
          setPosts((prev) => {
            const ids = new Set(prev.map((p) => p._id));
            return [...prev, ...result.posts.filter((p: BlogPost) => !ids.has(p._id))];
          });
        } else {
          setPosts(result.posts);
        }

        setTotalPages(result.meta?.totalPages || 1);
        setCurrentPage(page);
        loadedPagesRef.current.add(page);

        // Update available filters from response
        if (result.meta?.availableFilters) {
          setAvailableCategories(result.meta.availableFilters.categories || []);
          setAvailableTags(result.meta.availableFilters.tags || []);
        }
      } catch (e) {
        console.error('[BlogGrid] fetch error:', e);
      } finally {
        setIsLoading(false);
        setIsFiltering(false);
      }
    },
    [
      urlQ,
      urlTag,
      urlCategory,
      urlAuthor,
      urlSort,
      urlFromDate,
      urlToDate,
      urlMinReadingTime,
      urlMaxReadingTime,
      limit,
    ],
  );

  // ============ HANDLE FILTER CHANGES ============
  useEffect(() => {
    const currentFilters = {
      query: urlQ,
      tag: urlTag,
      category: urlCategory,
      author: urlAuthor,
      sort: urlSort,
      fromDate: urlFromDate,
      toDate: urlToDate,
      minReadingTime: urlMinReadingTime,
      maxReadingTime: urlMaxReadingTime,
      dateRange: urlDateRange,
    };

    const prevFilters = prevFiltersRef.current;

    // Check if any filter changed
    const hasChanged =
      currentFilters.query !== prevFilters.query ||
      currentFilters.tag !== prevFilters.tag ||
      currentFilters.category !== prevFilters.category ||
      currentFilters.author !== prevFilters.author ||
      currentFilters.sort !== prevFilters.sort ||
      currentFilters.fromDate !== prevFilters.fromDate ||
      currentFilters.toDate !== prevFilters.toDate ||
      currentFilters.minReadingTime !== prevFilters.minReadingTime ||
      currentFilters.maxReadingTime !== prevFilters.maxReadingTime ||
      currentFilters.dateRange !== prevFilters.dateRange;

    if (hasChanged) {
      loadedPagesRef.current = new Set();
      setCurrentPage(1);
      fetchWithParams(1, false);
      prevFiltersRef.current = currentFilters;
    }
  }, [
    urlQ,
    urlTag,
    urlCategory,
    urlAuthor,
    urlSort,
    urlFromDate,
    urlToDate,
    urlMinReadingTime,
    urlMaxReadingTime,
    urlDateRange,
    fetchWithParams,
  ]);

  // ============ INFINITE SCROLL ============
  const loadNextPage = useCallback(
    async (pageToLoad: number) => {
      if (
        isFetchingRef.current ||
        loadedPagesRef.current.has(pageToLoad) ||
        pageToLoad > totalPages
      ) {
        return;
      }
      isFetchingRef.current = true;
      await fetchWithParams(pageToLoad, true);
      isFetchingRef.current = false;
    },
    [totalPages, fetchWithParams],
  );

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    if (currentPage >= totalPages) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingRef.current && !isFiltering) {
          const next = currentPage + 1;
          if (next <= totalPages && !loadedPagesRef.current.has(next)) {
            loadNextPage(next);
          }
        }
      },
      { rootMargin: '200px' },
    );

    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [currentPage, totalPages, loadNextPage, isFiltering]);

  // ============ SCROLL HANDLER ============
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ============ UPDATE URL HELPER ============
  const updateFilter = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      params.delete('page');
      router.push(`/blog?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // ============ HANDLERS ============
  const handleTagClick = useCallback(
    (tag: string | null) => {
      updateFilter({ tag: tag || null });
    },
    [updateFilter],
  );

  const clearSearch = useCallback(() => updateFilter({ q: null }), [updateFilter]);
  const clearCategory = useCallback(() => updateFilter({ category: null }), [updateFilter]);
  const clearAuthor = useCallback(() => updateFilter({ author: null }), [updateFilter]);
  const clearDateRange = useCallback(
    () => updateFilter({ fromDate: null, toDate: null, dateRange: null }),
    [updateFilter],
  );
  const clearReadingTime = useCallback(
    () => updateFilter({ minReadingTime: null, maxReadingTime: null }),
    [updateFilter],
  );

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (urlSort && urlSort !== 'newest') params.set('sort', urlSort);
    router.push(`/blog${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
  }, [router, urlSort]);

  // ============ LOADING STATE ============
  if (isFiltering && posts.length === 0) {
    return (
      <div className="w-full pb-20 space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-grey-500">
            <div className="w-5 h-5 border-2 border-grey-200 border-t-red rounded-full animate-spin" />
            <span>Searching...</span>
          </div>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ============ RENDER ============
  return (
    <div className="w-full pb-20 space-y-8">
      {/* Search Results Header */}
      {urlQ && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg">
          <Search className="w-5 h-5" />
          <div className="flex-1">
            <span className="font-medium">Search results for &quot;{urlQ}&quot;</span>
            <p className="text-sm text-blue-600">
              {posts.length > 0
                ? `Found ${posts.length} matching posts`
                : 'No matching posts found'}
            </p>
          </div>
          <button
            onClick={clearSearch}
            className="p-1 hover:bg-blue-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Active Filters Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 p-4 bg-grey-50 rounded-xl border border-grey-200">
          <Filter className="w-4 h-4 text-grey-400 mr-2" />
          <span className="text-sm text-grey-500 mr-2">Active filters:</span>

          {urlQ && <FilterChip label="Search" value={urlQ} onRemove={clearSearch} icon={Search} />}
          {urlCategory && (
            <FilterChip label="Category" value={urlCategory} onRemove={clearCategory} />
          )}
          {urlTag && (
            <FilterChip label="Tag" value={`#${urlTag}`} onRemove={() => handleTagClick(null)} />
          )}
          {urlAuthor && (
            <FilterChip label="Author" value={urlAuthor} onRemove={clearAuthor} icon={User} />
          )}
          {(urlFromDate || urlToDate) && (
            <FilterChip
              label="Date"
              value={`${urlFromDate ? new Date(urlFromDate).toLocaleDateString() : '...'} - ${urlToDate ? new Date(urlToDate).toLocaleDateString() : '...'}`}
              onRemove={clearDateRange}
              icon={Calendar}
            />
          )}
          {(urlMinReadingTime || urlMaxReadingTime) && (
            <FilterChip
              label="Reading"
              value={`${urlMinReadingTime || '0'}-${urlMaxReadingTime || '∞'} min`}
              onRemove={clearReadingTime}
              icon={Clock}
            />
          )}

          <button
            onClick={clearAllFilters}
            className="ml-auto text-sm text-red hover:text-red-700 hover:underline transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Tags Cloud */}
      {!urlQ && <BlogTags tags={availableTags} activeTag={urlTag} onTagClick={handleTagClick} />}

      {/* Results Count */}
      {!isFiltering && posts.length > 0 && (
        <div className="text-sm text-grey-500">
          Showing {posts.length} of {totalPages * limit} results
          {urlSort !== 'relevance' && ` • Sorted by ${urlSort}`}
        </div>
      )}

      {/* Posts Grid */}
      <div className="space-y-6 relative">
        {isFiltering && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-start justify-center pt-32 backdrop-blur-sm">
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-lg border border-grey-200">
              <div className="w-5 h-5 border-2 border-grey-200 border-t-red rounded-full animate-spin" />
              <span className="text-grey-700 font-medium">Updating results...</span>
            </div>
          </div>
        )}

        {posts.map((post) => (
          <MemoizedBlogCard key={post._id} post={post} />
        ))}
      </div>

      {/* Infinite Scroll Sentinel */}
      {currentPage < totalPages && (
        <>
          <div ref={sentinelRef} className="w-full h-10" aria-hidden="true" />

          {isLoading && !isFiltering && (
            <div className="w-full space-y-6">
              {[...Array(2)].map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
              <div className="flex justify-center items-center py-6">
                <div className="flex items-center gap-2 text-grey-500">
                  <div className="w-4 h-4 border-2 border-grey-200 border-t-red rounded-full animate-spin" />
                  <span className="text-sm">Loading more posts...</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {posts.length === 0 && !isLoading && !isFiltering && (
        <div className="text-center py-20 bg-grey-50 rounded-2xl border border-grey-200">
          <Search className="w-16 h-16 text-grey-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-grey-900 mb-2">
            {urlQ ? `No results for "${urlQ}"` : 'No posts found'}
          </h3>
          <p className="text-grey-500 max-w-md mx-auto mb-6">
            {urlQ
              ? "Try adjusting your search or filters to find what you're looking for."
              : 'No posts match your current filters. Try adjusting your criteria.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-6 py-2 bg-red text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* End of Results */}
      {currentPage >= totalPages && posts.length > 0 && (
        <div className="text-center py-8 text-grey-400 text-sm border-t border-grey-200">
          You&apos;ve reached the end • {posts.length} posts total
        </div>
      )}

      {showScrollTop && <ScrollToTopButton />}
    </div>
  );
}
