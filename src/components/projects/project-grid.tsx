// src/components/projects/projects-grid.tsx
'use client';

import { useState, memo } from 'react';
import { Project } from '@/lib/types/models';
import { ProjectCard } from './project-card';
import { ProjectCardSkeleton } from './project-card-skeleton';
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
  const [isFetching, setIsFetching] = useState(false);

  const loadMore = async () => {
    if (isFetching || !hasMore) return;

    setIsFetching(true);
    setIsLoading(true);

    try {
      const result = await getProjects({ page, limit });

      if (result.success && result.projects.length > 0) {
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
      setIsFetching(false);
      setIsLoading(false);
    }
  };

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
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <MemoizedProjectCard key={project._id} project={project} />
        ))}

        {/* Show skeletons when loading more */}
        {isLoading && (
          <>
            {[...Array(limit)].map((_, i) => (
              <ProjectCardSkeleton key={`skeleton-${i}`} />
            ))}
          </>
        )}
      </div>

      {/* Load more button */}
      {hasMore && !isLoading && (
        <div className="text-center py-4">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-red text-white rounded-full text-sm hover:bg-red/90 transition-colors"
          >
            Load More Projects
          </button>
        </div>
      )}

      {!hasMore && projects.length > initialProjects.length && (
        <div className="text-center py-4 text-sm text-grey-500">
          All {projects.length} projects loaded
        </div>
      )}
    </div>
  );
}
