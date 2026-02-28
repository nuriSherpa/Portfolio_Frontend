// src/components/projects/projects-grid.tsx
'use client';

import { useState, useCallback, memo, useRef, useEffect, useMemo } from 'react';
import { Project } from '@/lib/types/models';
import { ProjectCard } from './project-card';
import { ProjectCardSkeleton } from './project-card-skeleton';
import { ProjectFilter } from './project-filter';
import { getProjects } from '@/lib/api/actions/projects';

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
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(initialPagination?.hasNextPage ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const isFetchingRef = useRef(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  // Local filtering
  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') return projects;
    return projects.filter((p) => p.projectStatus === activeFilter);
  }, [projects, activeFilter]);

  // Only load more when user has scrolled and loader is visible
  useEffect(() => {
    if (!loaderRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // Only trigger if user has scrolled (not on initial load) and not already fetching
        if (entry.isIntersecting && !isFetchingRef.current && hasScrolled.current) {
          loadMore();
        }
      },
      {
        threshold: 0,
        rootMargin: '100px',
      },
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  // Track scroll to prevent initial load trigger
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        hasScrolled.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const result = await getProjects(limit, page);

      if (result.projects.length > 0) {
        setProjects((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const newProjects = result.projects.filter((p) => !existingIds.has(p._id));
          return [...prev, ...newProjects];
        });

        setPage((p) => p + 1);
        setHasMore(result.pagination?.hasNextPage ?? false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Load failed:', error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [page, limit, hasMore]);

  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
  }, []);

  if (!projects.length) {
    return (
      <div className="text-center py-20">
        <div className="bg-white border border-grey-200 rounded-xl p-8 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-black mb-2">No projects yet</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      <ProjectFilter activeFilter={activeFilter} onFilterChange={handleFilterChange} />

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <MemoizedProjectCard key={project._id} project={project} />
        ))}
      </div>

      {/* Loading Area - Only show loader if more pages exist */}
      {hasMore && (
        <div ref={loaderRef} className="w-full">
          {isLoading ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(limit)].map((_, i) => (
                  <ProjectCardSkeleton key={`skeleton-${page}-${i}`} />
                ))}
              </div>

              <div className="flex justify-center items-center py-8">
                <div className="flex items-center gap-2 text-grey-500">
                  <div className="w-5 h-5 border-2 border-grey-200 border-t-red rounded-full animate-spin" />
                  <span className="text-sm">Loading more projects...</span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-20" />
          )}
        </div>
      )}

      {/* End message */}
      {!hasMore && projects.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-grey-500">
            ✨ You've seen all{' '}
            <span className="text-red font-semibold">{filteredProjects.length}</span> projects
          </p>
        </div>
      )}
    </div>
  );
}
