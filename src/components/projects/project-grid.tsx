// src/components/projects/projects-grid.tsx
'use client';

import { useState, useCallback, memo, useRef, useEffect, useMemo } from 'react';
import { Project } from '@/lib/types/models';
import { ProjectCard } from './project-card';
import { ProjectCardSkeleton } from './project-card-skeleton';
import { ProjectFilter } from './project-filter';
import { getProjects } from '@/lib/api/actions/projects';
import { ScrollToTopButton } from '../shared/scroll-to-top-button';
import { globalCache } from '@/lib/cache/cache';

interface ProjectsGridProps {
  initialProjects: Project[];
  initialPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
  } | null;
  limit: number;
}

const MemoizedProjectCard = memo(ProjectCard);
const CACHE_KEY_ALL = 'projects-all';
const CACHE_KEY_PAGE = (page: number) => `projects-page-${page}`;
const SCROLL_POS_KEY = 'projects-scroll-position';
const SCROLL_RESTORED_KEY = 'projects-scroll-restored';

export function ProjectsGrid({ initialProjects, initialPagination, limit }: ProjectsGridProps) {
  // Use SSR data as initial state if available
  const hasSSRData = initialProjects.length > 0;

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [currentPage, setCurrentPage] = useState(hasSSRData ? 1 : 1);
  const [totalPages, setTotalPages] = useState(initialPagination?.totalPages || 1);
  const [isLoading, setIsLoading] = useState(!hasSSRData); // Only loading if no SSR data
  const [activeFilter, setActiveFilter] = useState('all');
  const [loadingPage, setLoadingPage] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // CRITICAL: Use ref to prevent double initialization
  const isInitializedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadedPagesRef = useRef<Set<number>>(new Set(hasSSRData ? [1] : []));
  const scrollRestoredRef = useRef(false);

  // ============================
  // CRITICAL: SCROLL RESTORATION (Before anything else)
  // ============================
  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const savedPosition = sessionStorage.getItem(SCROLL_POS_KEY);
    const hasBeenRestored = sessionStorage.getItem(SCROLL_RESTORED_KEY);

    if (savedPosition && !hasBeenRestored && !scrollRestoredRef.current) {
      const scrollY = parseInt(savedPosition, 10);

      // Restore immediately without animation
      window.scrollTo(0, scrollY);

      // Mark as restored to prevent multiple restorations
      scrollRestoredRef.current = true;
      sessionStorage.setItem(SCROLL_RESTORED_KEY, 'true');

      console.log('[Scroll Restore] Restored to position:', scrollY);
    }

    // Cleanup: Clear the restored flag after a delay to allow future saves
    const cleanupTimer = setTimeout(() => {
      sessionStorage.removeItem(SCROLL_RESTORED_KEY);
    }, 1000);

    return () => clearTimeout(cleanupTimer);
  }, []);

  // ============================
  // SAVE SCROLL POSITION (Before navigation)
  // ============================
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem(SCROLL_POS_KEY, window.scrollY.toString());
    };

    // Also save on visibility change (more reliable for mobile)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sessionStorage.setItem(SCROLL_POS_KEY, window.scrollY.toString());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // ============================
  // INITIALIZE: SSR or Cache or Fetch
  // ============================
  useEffect(() => {
    // PREVENT DOUBLE INITIALIZATION (React StrictMode)
    if (isInitializedRef.current) {
      console.log('[Init] Already initialized, skipping');
      return;
    }
    isInitializedRef.current = true;

    const initialize = async () => {
      try {
        // 1. HAS SSR DATA: Save to cache
        if (hasSSRData) {
          console.log('[Init] Using SSR data, saving to cache');

          await globalCache.set(
            CACHE_KEY_ALL,
            {
              projects: initialProjects,
              currentPage: 1,
              totalPages: initialPagination?.totalPages || 1,
              loadedPages: [1],
            },
            1000 * 60 * 60,
          );

          return;
        }

        // 2. NO SSR DATA: Check client cache
        const cached = await globalCache.get<any>(CACHE_KEY_ALL);

        if (cached && cached.projects.length > 0) {
          console.log(`[Client Cache] Restoring ${cached.projects.length} projects`);

          setProjects(cached.projects);
          setCurrentPage(cached.currentPage);
          setTotalPages(cached.totalPages);
          loadedPagesRef.current = new Set(cached.loadedPages || [1]);
        } else {
          // 3. NO CACHE: Fetch from server
          console.log('[Init] No SSR, no cache - fetching from server');
          const result = await getProjects(limit, 1);

          if (result.projects.length > 0) {
            loadedPagesRef.current.add(1);
            setProjects(result.projects);
            setTotalPages(result.pagination?.totalPages || 1);

            await globalCache.set(
              CACHE_KEY_ALL,
              {
                projects: result.projects,
                currentPage: 1,
                totalPages: result.pagination?.totalPages || 1,
                loadedPages: [1],
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
  }, [hasSSRData, initialProjects, initialPagination, limit]);

  // ============================
  // SCROLL TRACKING (for scroll-to-top button only)
  // ============================
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ============================
  // LOAD PAGE (Client Cache → Server)
  // ============================
  const loadPage = useCallback(
    async (pageToLoad: number) => {
      if (
        isFetchingRef.current ||
        loadedPagesRef.current.has(pageToLoad) ||
        pageToLoad > totalPages
      ) {
        return;
      }

      // Try client cache first
      try {
        const cached = await globalCache.get<any>(CACHE_KEY_PAGE(pageToLoad));
        if (cached?.projects) {
          console.log(`[Client Cache] Page ${pageToLoad} hit`);
          loadedPagesRef.current.add(pageToLoad);

          setProjects((prev) => {
            const ids = new Set(prev.map((p) => p._id));
            const newProjects = cached.projects.filter((p: Project) => !ids.has(p._id));
            return [...prev, ...newProjects];
          });

          setCurrentPage(pageToLoad);
          return;
        }
      } catch (e) {
        console.error('[Client Cache] Read error:', e);
      }

      // Fetch from server
      console.log(`[Client Cache] Page ${pageToLoad} miss, fetching server...`);
      isFetchingRef.current = true;
      setIsLoading(true);
      setLoadingPage(pageToLoad);

      try {
        const result = await getProjects(limit, pageToLoad);

        if (result.projects.length > 0) {
          loadedPagesRef.current.add(pageToLoad);

          setProjects((prev) => {
            const ids = new Set(prev.map((p) => p._id));
            const newProjects = result.projects.filter((p) => !ids.has(p._id));
            return [...prev, ...newProjects];
          });

          setCurrentPage(pageToLoad);
          setTotalPages(result.pagination?.totalPages || totalPages);

          await globalCache.set(
            CACHE_KEY_PAGE(pageToLoad),
            {
              projects: result.projects,
              pagination: result.pagination,
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
    [limit, totalPages],
  );

  // ============================
  // CLIENT CACHE: Save on changes
  // ============================
  useEffect(() => {
    if (projects.length === 0) return;

    const saveCache = async () => {
      try {
        await globalCache.set(
          CACHE_KEY_ALL,
          {
            projects,
            currentPage,
            totalPages,
            loadedPages: Array.from(loadedPagesRef.current),
          },
          1000 * 60 * 60,
        );
      } catch (e) {
        console.error('[Client Cache] Save error:', e);
      }
    };

    saveCache();
  }, [projects, currentPage, totalPages]);

  // ============================
  // INTERSECTION OBSERVER
  // ============================
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

  // ============================
  // FILTER
  // ============================
  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') return projects;
    return projects.filter((p) => p.projectStatus === activeFilter);
  }, [projects, activeFilter]);

  // ============================
  // RENDER
  // ============================
  if (isLoading && projects.length === 0) {
    return (
      <div className="w-full pb-20">
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ProjectCardSkeleton key={`initial-skeleton-${i}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      <div className="space-y-8">
        <ProjectFilter activeFilter={activeFilter} onFilterChange={handleFilterChange} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <MemoizedProjectCard key={project._id} project={project} />
          ))}
        </div>

        {currentPage < totalPages && (
          <>
            <div ref={sentinelRef} className="w-full h-10" aria-hidden="true" />
            {isLoading && loadingPage === currentPage + 1 && (
              <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <ProjectCardSkeleton key={`skeleton-${loadingPage}-${i}`} />
                  ))}
                </div>
                <div className="flex justify-center items-center py-6">
                  <div className="flex items-center gap-2 text-grey-500">
                    <div className="w-4 h-4 border-2 border-grey-200 border-t-red rounded-full animate-spin" />
                    <span className="text-sm">Loading page {loadingPage}...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {currentPage >= totalPages && projects.length > 0 && showScrollTop && <ScrollToTopButton />}
      </div>
    </div>
  );
}
