// src/components/blog/blog-grid.tsx
'use client';

import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { BlogPost } from '@/lib/types/models';
import { BlogCard } from './blog-card';
import { BlogCardSkeleton } from './blog-card-skeleton';
import { getPosts, searchPosts } from '@/lib/api/actions/blog';
import { ScrollToTopButton } from '../shared/scroll-to-top-button';
import { useSearchParams } from 'next/navigation';

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

export function BlogGrid({ initialPosts, initialMeta, limit }: BlogGridProps) {
  const searchParams = useSearchParams();

  const urlQ = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlSort = searchParams.get('sort') || 'newest';
  const urlAuthor = searchParams.get('author') || '';
  const urlFromDate = searchParams.get('fromDate') || '';
  const urlToDate = searchParams.get('toDate') || '';
  const urlMinReadingTime = searchParams.get('minReadingTime') || '';
  const urlMaxReadingTime = searchParams.get('maxReadingTime') || '';
  const urlDateRange = searchParams.get('dateRange') || '';
  const urlTagsRaw = searchParams.get('tags') || '';
  const urlTags = urlTagsRaw ? urlTagsRaw.split(',').filter(Boolean) : [];

  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [currentPage, setCurrentPage] = useState(initialMeta?.page || 1);
  const [totalPages, setTotalPages] = useState(initialMeta?.totalPages || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const isFetchingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadedPagesRef = useRef<Set<number>>(new Set([1]));
  const prevKeyRef = useRef('');

  const hasFilters = !!(
    urlQ ||
    urlCategory ||
    urlTagsRaw ||
    urlAuthor ||
    urlFromDate ||
    urlToDate ||
    urlMinReadingTime ||
    urlMaxReadingTime
  );

  // ── Fetch: use getPosts for no-filter, searchPosts for filtered ──
  const fetchPosts = useCallback(
    async (page: number, append = false) => {
      if (!append && loadedPagesRef.current.has(page) && page === currentPage) return;
      if (append) setIsLoading(true);
      else setIsFiltering(true);

      try {
        let result;

        if (hasFilters) {
          // Use search endpoint for any filter
          result = await searchPosts(urlQ, {
            tags: urlTagsRaw || undefined,
            tag: urlTags.length === 1 ? urlTags[0] : undefined,
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
        } else {
          // Use getPosts for clean initial load
          result = await getPosts(limit, page, undefined, urlSort, undefined);
        }

        const newPosts = result.posts || [];

        if (append) {
          setPosts((prev) => {
            const ids = new Set(prev.map((p) => p._id));
            return [...prev, ...newPosts.filter((p: BlogPost) => !ids.has(p._id))];
          });
        } else {
          setPosts(newPosts);
        }

        setTotalPages(result.meta?.totalPages || 1);
        setCurrentPage(page);
        loadedPagesRef.current.add(page);
      } catch (e) {
        console.error('[BlogGrid] fetch error:', e);
      } finally {
        setIsLoading(false);
        setIsFiltering(false);
      }
    },
    [
      urlQ,
      urlTagsRaw,
      urlCategory,
      urlAuthor,
      urlSort,
      urlFromDate,
      urlToDate,
      urlMinReadingTime,
      urlMaxReadingTime,
      limit,
      hasFilters,
    ],
  );

  // Re-fetch when URL params change
  useEffect(() => {
    const key = [
      urlQ,
      urlTagsRaw,
      urlCategory,
      urlAuthor,
      urlSort,
      urlFromDate,
      urlToDate,
      urlMinReadingTime,
      urlMaxReadingTime,
      urlDateRange,
    ].join('|');
    if (key !== prevKeyRef.current) {
      prevKeyRef.current = key;
      loadedPagesRef.current = new Set();
      setCurrentPage(1);
      fetchPosts(1, false);
    }
  }, [
    urlQ,
    urlTagsRaw,
    urlCategory,
    urlAuthor,
    urlSort,
    urlFromDate,
    urlToDate,
    urlMinReadingTime,
    urlMaxReadingTime,
    urlDateRange,
    fetchPosts,
  ]);

  // Sync SSR initial data
  useEffect(() => {
    setPosts(initialPosts);
    setCurrentPage(initialMeta?.page || 1);
    setTotalPages(initialMeta?.totalPages || 1);
    loadedPagesRef.current = new Set([initialMeta?.page || 1]);
  }, [initialPosts, initialMeta]);

  // Infinite scroll
  const loadNextPage = useCallback(
    async (pageToLoad: number) => {
      if (
        isFetchingRef.current ||
        loadedPagesRef.current.has(pageToLoad) ||
        pageToLoad > totalPages
      )
        return;
      isFetchingRef.current = true;
      await fetchPosts(pageToLoad, true);
      isFetchingRef.current = false;
    },
    [totalPages, fetchPosts],
  );

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    if (currentPage >= totalPages) return;
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingRef.current && !isFiltering) {
          const next = currentPage + 1;
          if (next <= totalPages && !loadedPagesRef.current.has(next)) loadNextPage(next);
        }
      },
      { rootMargin: '200px' },
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [currentPage, totalPages, loadNextPage, isFiltering]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (isFiltering && posts.length === 0) {
    return (
      <div className="w-full pb-20 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-grey-500">
            <div className="w-5 h-5 border-2 border-grey-200 border-t-red rounded-full animate-spin" />
            <span>Loading posts...</span>
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

  return (
    <div className="w-full pb-20 space-y-6">
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

      {posts.length === 0 && !isLoading && !isFiltering && (
        <div className="text-center py-20 bg-grey-50 rounded-2xl border border-grey-200">
          <Search className="w-16 h-16 text-grey-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-grey-900 mb-2">
            {urlQ ? `No results for "${urlQ}"` : 'No posts found'}
          </h3>
          <p className="text-grey-500 max-w-md mx-auto">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
