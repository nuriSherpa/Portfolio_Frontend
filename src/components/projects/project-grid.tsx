// src/components/projects/projects-grid.tsx
'use client';

import { useState, useCallback, memo, useRef, useEffect, useMemo } from 'react';
import { Project } from '@/lib/types/models';
import { ProjectCard } from './project-card';
import { ProjectCardSkeleton } from './project-card-skeleton';
import { ProjectFilter } from './project-filter';
import { getProjects } from '@/lib/api/actions/projects';
import { ArrowUp } from 'lucide-react';

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

export function ProjectsGrid({ initialProjects, initialPagination, limit }: ProjectsGridProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialPagination?.totalPages || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loadingPage, setLoadingPage] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const isFetchingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadedPagesRef = useRef<Set<number>>(new Set([1]));

  // ============================
  // SCROLL TO TOP FUNCTION
  // ============================
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  // ============================
  // SCROLL POSITION TRACKING
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
  // LOAD SPECIFIC PAGE
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
  // INTERSECTION OBSERVER SETUP
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
      {
        root: null,
        rootMargin: '200px',
        threshold: 0,
      },
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observerRef.current.observe(currentSentinel);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [currentPage, totalPages, loadPage]);

  // ============================
  // FILTER HANDLING
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
  return (
    <div className="w-full pb-20">
      <div className="space-y-8">
        <ProjectFilter activeFilter={activeFilter} onFilterChange={handleFilterChange} />

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <MemoizedProjectCard key={project._id} project={project} />
          ))}
        </div>

        {/* Loading indicator and sentinel */}
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
                    <span className="text-sm">
                      Loading page {loadingPage} of {totalPages}...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* End of content with Go to Top button */}
        {currentPage >= totalPages && projects.length > 0 && showScrollTop && (
          <div className="flex justify-center py-12">
            <button
              onClick={scrollToTop}
              className="bg-red text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-red/90 transition-colors"
            >
              <ArrowUp size={18} />
              Go to Top
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
