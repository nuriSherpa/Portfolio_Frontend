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
const NAVIGATING_KEY = 'projects-navigating-to-detail';

export function ProjectsGrid({ initialProjects, initialPagination, limit }: ProjectsGridProps) {
  const hasSSRData = initialProjects.length > 0;

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialPagination?.totalPages || 1);
  const [isLoading, setIsLoading] = useState(!hasSSRData);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loadingPage, setLoadingPage] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const isInitializedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadedPagesRef = useRef<Set<number>>(new Set(hasSSRData ? [1] : []));

  // On mount: either restore state from cache (back nav) or seed cache from SSR data
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const wasNavigating = sessionStorage.getItem(NAVIGATING_KEY);
    const savedPosition = sessionStorage.getItem(SCROLL_POS_KEY);

    if (wasNavigating === 'true') {
      // ── Back navigation: restore grid state from local cache, no server request ──
      const restore = async () => {
        const cached = await globalCache.get<any>(CACHE_KEY_ALL);
        if (cached?.projects?.length > 0) {
          setProjects(cached.projects);
          setCurrentPage(cached.currentPage);
          setTotalPages(cached.totalPages);
          loadedPagesRef.current = new Set(cached.loadedPages || [1]);
        }
        setIsLoading(false);

        // Clean up flags immediately so a manual refresh won't trigger this branch
        sessionStorage.removeItem(NAVIGATING_KEY);

        // Restore scroll position AFTER the grid has painted.
        // A single rAF fires before the browser composites the frame, so we need
        // either a double-rAF or a short setTimeout to let React flush + paint first.
        if (savedPosition) {
          const y = parseInt(savedPosition, 10);
          if (y > 0) {
            // Double rAF: first frame schedules layout, second frame reads it
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
                sessionStorage.removeItem(SCROLL_POS_KEY);
              });
            });
          }
        }
      };
      restore();
      return;
    }

    // ── Normal / hard-reload init: seed local cache from SSR data ──
    const init = async () => {
      if (hasSSRData) {
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
      } else {
        // No SSR data (e.g. dev without cache warming) — try local cache
        const cached = await globalCache.get<any>(CACHE_KEY_ALL);
        if (cached?.projects?.length > 0) {
          setProjects(cached.projects);
          setCurrentPage(cached.currentPage);
          setTotalPages(cached.totalPages);
          loadedPagesRef.current = new Set(cached.loadedPages || [1]);
        }
      }
      setIsLoading(false);
    };
    init();
  }, [hasSSRData, initialProjects, initialPagination, limit]);

  // Scroll tracking for the "back to top" button
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keep local cache in sync whenever projects/pagination state changes
  useEffect(() => {
    if (projects.length === 0) return;
    globalCache.set(
      CACHE_KEY_ALL,
      {
        projects,
        currentPage,
        totalPages,
        loadedPages: Array.from(loadedPagesRef.current),
      },
      1000 * 60 * 60,
    );
  }, [projects, currentPage, totalPages]);

  // Load a specific page (checks local cache first, falls back to server)
  const loadPage = useCallback(
    async (pageToLoad: number) => {
      if (
        isFetchingRef.current ||
        loadedPagesRef.current.has(pageToLoad) ||
        pageToLoad > totalPages
      )
        return;

      // Try local page-level cache first
      try {
        const cached = await globalCache.get<any>(CACHE_KEY_PAGE(pageToLoad));
        if (cached?.projects) {
          loadedPagesRef.current.add(pageToLoad);
          setProjects((prev) => {
            const ids = new Set(prev.map((p) => p._id));
            const newProjects = cached.projects.filter((p: Project) => !ids.has(p._id));
            return [...prev, ...newProjects];
          });
          setCurrentPage(pageToLoad);
          return;
        }
      } catch (_) {}

      // Cache miss — fetch from Next.js server action (which may itself hit its own cache)
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
            { projects: result.projects, pagination: result.pagination },
            1000 * 60 * 60,
          );
        }
      } finally {
        setIsLoading(false);
        setLoadingPage(null);
        isFetchingRef.current = false;
      }
    },
    [limit, totalPages],
  );

  // Infinite scroll sentinel
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
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

    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [currentPage, totalPages, loadPage]);

  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') return projects;
    return projects.filter((p) => p.projectStatus === activeFilter);
  }, [projects, activeFilter]);

  // Initial loading state (no projects yet)
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
      </div>
    </div>
  );
}
