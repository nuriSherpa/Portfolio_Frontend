'use client';

import { useState, useCallback, memo, useRef, useEffect, useMemo } from 'react';
import { BlogPost } from '@/lib/types/models';
import { BlogCard } from './blog-card';
import { BlogCardSkeleton } from './blog-card-skeleton';
import { BlogSearch } from './blog-search';
import { BlogTags } from './blog-tags';
import { getPosts } from '@/lib/api/actions/posts';
import { ScrollToTopButton } from '../shared/scroll-to-top-button';
import { globalCache } from '@/lib/cache/cache';

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
const CACHE_KEY_ALL = 'posts-all';
const CACHE_KEY_PAGE = (page: number) => `posts-page-${page}`;

export function BlogGrid({ initialPosts, initialMeta, initialFilters, limit }: BlogGridProps) {
  const hasSSRData = initialPosts.length > 0;

  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [currentPage, setCurrentPage] = useState(hasSSRData ? 1 : 1);
  const [totalPages, setTotalPages] = useState(initialMeta?.totalPages || 1);
  const [isLoading, setIsLoading] = useState(!hasSSRData);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loadingPage, setLoadingPage] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [availableTags, setAvailableTags] = useState(initialFilters.tags || []);

  const isInitializedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadedPagesRef = useRef<Set<number>>(new Set(hasSSRData ? [1] : []));
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initialize = async () => {
      try {
        if (hasSSRData) {
          console.log('[Init] Using SSR data, saving to cache');
          await globalCache.set(
            CACHE_KEY_ALL,
            {
              posts: initialPosts,
              currentPage: 1,
              totalPages: initialMeta?.totalPages || 1,
              loadedPages: [1],
              tags: availableTags,
            },
            1000 * 60 * 60,
          );

          const savedScroll = sessionStorage.getItem('blog-scroll-position');
          if (savedScroll) {
            setTimeout(() => {
              window.scrollTo(0, parseInt(savedScroll));
              sessionStorage.removeItem('blog-scroll-position');
            }, 100);
          }
          return;
        }

        const cached = await globalCache.get<any>(CACHE_KEY_ALL);
        const hasScrollPosition = sessionStorage.getItem('blog-scroll-position') !== null;

        if (cached && cached.posts.length > 0) {
          console.log(`[Client Cache] Restoring ${cached.posts.length} posts`);
          setPosts(cached.posts);
          setCurrentPage(cached.currentPage);
          setTotalPages(cached.totalPages);
          setAvailableTags(cached.tags || initialFilters.tags);
          loadedPagesRef.current = new Set(cached.loadedPages || [1]);

          if (hasScrollPosition) {
            const savedScroll = sessionStorage.getItem('blog-scroll-position');
            setTimeout(() => {
              window.scrollTo(0, parseInt(savedScroll!));
              sessionStorage.removeItem('blog-scroll-position');
            }, 100);
          }
        } else {
          console.log('[Init] No SSR, no cache - fetching from server');
          const result = await getPosts(limit, 1);

          if (result.posts.length > 0) {
            loadedPagesRef.current.add(1);
            setPosts(result.posts);
            setTotalPages(result.meta?.totalPages || 1);
            setAvailableTags(result.filters.tags);

            await globalCache.set(
              CACHE_KEY_ALL,
              {
                posts: result.posts,
                currentPage: 1,
                totalPages: result.meta?.totalPages || 1,
                loadedPages: [1],
                tags: result.filters.tags,
              },
              1000 * 60 * 60,
            );
          }
        }
      } catch (e) {
        console.error('[Init] Error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [hasSSRData, initialPosts, initialMeta, limit, initialFilters.tags]);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Search with debounce
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          const result = await getPosts(limit, 1, activeTag || undefined, query || undefined);
          setPosts(result.posts);
          setCurrentPage(1);
          setTotalPages(result.meta.totalPages);
          loadedPagesRef.current = new Set([1]);

          await globalCache.set(
            CACHE_KEY_ALL,
            {
              posts: result.posts,
              currentPage: 1,
              totalPages: result.meta.totalPages,
              loadedPages: [1],
              tags: availableTags,
            },
            1000 * 60 * 60,
          );
        } catch (e) {
          console.error('[Search] Error:', e);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    },
    [activeTag, limit, availableTags],
  );

  // Tag filter
  const handleTagClick = useCallback(
    async (tag: string | null) => {
      setActiveTag(tag);
      setIsLoading(true);
      setCurrentPage(1);
      loadedPagesRef.current = new Set();

      try {
        const result = await getPosts(limit, 1, tag || undefined, searchQuery || undefined);
        setPosts(result.posts);
        setTotalPages(result.meta.totalPages);
        loadedPagesRef.current.add(1);

        await globalCache.set(
          CACHE_KEY_ALL,
          {
            posts: result.posts,
            currentPage: 1,
            totalPages: result.meta.totalPages,
            loadedPages: [1],
            tags: availableTags,
          },
          1000 * 60 * 60,
        );
      } catch (e) {
        console.error('[Tag Filter] Error:', e);
      } finally {
        setIsLoading(false);
      }
    },
    [limit, searchQuery, availableTags],
  );

  // Load page
  const loadPage = useCallback(
    async (pageToLoad: number) => {
      if (
        isFetchingRef.current ||
        loadedPagesRef.current.has(pageToLoad) ||
        pageToLoad > totalPages
      ) {
        return;
      }

      try {
        const cached = await globalCache.get<any>(CACHE_KEY_PAGE(pageToLoad));
        if (cached?.posts) {
          console.log(`[Client Cache] Page ${pageToLoad} hit`);
          loadedPagesRef.current.add(pageToLoad);

          setPosts((prev) => {
            const ids = new Set(prev.map((p) => p._id));
            const newPosts = cached.posts.filter((p: BlogPost) => !ids.has(p._id));
            return [...prev, ...newPosts];
          });

          setCurrentPage(pageToLoad);
          return;
        }
      } catch (e) {
        console.error('[Client Cache] Read error:', e);
      }

      console.log(`[Client Cache] Page ${pageToLoad} miss, fetching server...`);
      isFetchingRef.current = true;
      setIsLoading(true);
      setLoadingPage(pageToLoad);

      try {
        const result = await getPosts(
          limit,
          pageToLoad,
          activeTag || undefined,
          searchQuery || undefined,
        );

        if (result.posts.length > 0) {
          loadedPagesRef.current.add(pageToLoad);

          setPosts((prev) => {
            const ids = new Set(prev.map((p) => p._id));
            const newPosts = result.posts.filter((p) => !ids.has(p._id));
            return [...prev, ...newPosts];
          });

          setCurrentPage(pageToLoad);
          setTotalPages(result.meta?.totalPages || totalPages);

          await globalCache.set(
            CACHE_KEY_PAGE(pageToLoad),
            {
              posts: result.posts,
              meta: result.meta,
            },
            1000 * 60 * 60,
          );
        }
      } catch (err) {
        console.error(`Failed to load page ${pageToLoad}:`, err);
      } finally {
        setIsLoading(false);
        setLoadingPage(null);
        isFetchingRef.current = false;
      }
    },
    [limit, totalPages, activeTag, searchQuery],
  );

  // Save cache on changes
  useEffect(() => {
    if (posts.length === 0) return;

    const saveCache = async () => {
      try {
        await globalCache.set(
          CACHE_KEY_ALL,
          {
            posts,
            currentPage,
            totalPages,
            loadedPages: Array.from(loadedPagesRef.current),
            tags: availableTags,
          },
          1000 * 60 * 60,
        );
      } catch (e) {
        console.error('[Client Cache] Save error:', e);
      }
    };

    saveCache();
  }, [posts, currentPage, totalPages, availableTags]);

  // Intersection Observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (currentPage >= totalPages) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isFetchingRef.current) {
          const nextPage = currentPage + 1;
          if (nextPage <= totalPages && !loadedPagesRef.current.has(nextPage)) {
            loadPage(nextPage);
          }
        }
      },
      { root: null, rootMargin: '200px', threshold: 0 },
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [currentPage, totalPages, loadPage]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading && posts.length === 0) {
    return (
      <div className="w-full pb-20 space-y-8">
        <BlogSearch onSearch={handleSearch} initialValue={searchQuery} isLoading={isLoading} />
        <BlogTags tags={availableTags} activeTag={activeTag} onTagClick={handleTagClick} />
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <BlogCardSkeleton key={`initial-skeleton-${i}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-20 space-y-8">
      <BlogSearch onSearch={handleSearch} initialValue={searchQuery} isLoading={isLoading} />

      <BlogTags tags={availableTags} activeTag={activeTag} onTagClick={handleTagClick} />

      <div className="space-y-6">
        {posts.map((post) => (
          <MemoizedBlogCard key={post._id} post={post} />
        ))}
      </div>

      {currentPage < totalPages && (
        <>
          <div ref={sentinelRef} className="w-full h-10" aria-hidden="true" />
          {isLoading && loadingPage === currentPage + 1 && (
            <div className="w-full space-y-6">
              {[...Array(2)].map((_, i) => (
                <BlogCardSkeleton key={`skeleton-${loadingPage}-${i}`} />
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

      {posts.length === 0 && !isLoading && (
        <div className="text-center py-20">
          <p className="text-grey-500 text-lg">No posts found matching your criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveTag(null);
              handleTagClick(null);
            }}
            className="mt-4 text-red hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {currentPage >= totalPages && posts.length > 0 && showScrollTop && <ScrollToTopButton />}
    </div>
  );
}
