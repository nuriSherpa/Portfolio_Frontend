// src/components/projects/lazy-projects-grid.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Project } from '@/lib/types/project';
import { ProjectCard } from './project-card';
import { ProjectCardSkeleton } from './project-card-skeleton';
import { getMoreProjects } from '@/lib/api/actions/projects';

interface LazyProjectsGridProps {
  initialProjects: Project[];
  initialPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
  limit: number;
}

export function LazyProjectsGrid({
  initialProjects,
  initialPagination,
  limit,
}: LazyProjectsGridProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [hasMore, setHasMore] = useState(initialPagination.hasNextPage);
  const [nextPageToLoad, setNextPageToLoad] = useState(2);

  const loaderRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const skeletonTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    console.log(`📊 Initial: ${projects.length}/${pagination.totalItems} projects`);
  }, [projects.length, pagination.totalItems]);

  const loadNextChunk = useCallback(async () => {
    // Don't load if already loading or no more pages
    if (loadingRef.current || !hasMore) return;

    // Don't load if we've reached the last page
    if (nextPageToLoad > pagination.totalPages) {
      setHasMore(false);
      setShowSkeletons(false);
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setShowSkeletons(true);

    try {
      console.log(`📦 Loading chunk ${nextPageToLoad}...`);

      const result = await getMoreProjects(nextPageToLoad, limit);

      if (result.success && result.projects.length > 0) {
        // Add new projects to the list
        setProjects((prev) => [...prev, ...result.projects]);
        setPagination(result.pagination!);

        // Update next page to load
        setNextPageToLoad((prev) => prev + 1);

        // Check if there are more pages
        setHasMore(result.pagination?.hasNextPage || false);

        console.log(
          `✅ Chunk ${nextPageToLoad} loaded - Total: ${projects.length + result.projects.length}/${pagination.totalItems}`,
        );
      } else {
        console.log(`❌ No more chunks`);
        setHasMore(false);
      }
    } catch (error) {
      console.error(`🔥 Error:`, error);
    } finally {
      setLoading(false);
      // Keep skeletons visible for a moment to show loading happened
      setTimeout(() => {
        setShowSkeletons(false);
      }, 500);
      loadingRef.current = false;
    }
  }, [
    hasMore,
    nextPageToLoad,
    limit,
    pagination.totalPages,
    pagination.totalItems,
    projects.length,
  ]);

  // Handle scroll with debounce
  const handleScroll = useCallback(() => {
    // Clear existing timeouts
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    if (skeletonTimeoutRef.current) {
      clearTimeout(skeletonTimeoutRef.current);
    }

    // Show skeletons immediately when scrolling
    if (hasMore && !loadingRef.current && !showSkeletons) {
      console.log('👻 Showing skeletons - user is scrolling');
      setShowSkeletons(true);
    }

    // Check if we're near the bottom
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const nearBottom = scrollY + windowHeight >= documentHeight - 500; // Within 500px of bottom

    // Set timeout to check when scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      // When scrolling stops, check if we need to load more
      if (nearBottom && hasMore && !loadingRef.current) {
        console.log('🎯 Scroll stopped near bottom - loading next chunk');
        loadNextChunk();
      } else if (!nearBottom && showSkeletons && !loadingRef.current) {
        // If not near bottom and not loading, hide skeletons after a delay
        skeletonTimeoutRef.current = setTimeout(() => {
          setShowSkeletons(false);
        }, 300);
      }
    }, 400); // Wait 400ms after scroll stops
  }, [hasMore, loadNextChunk, showSkeletons]);

  // Add scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (skeletonTimeoutRef.current) {
        clearTimeout(skeletonTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="bg-blue-600 text-white p-2 rounded-lg text-sm sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div>
            📦 {projects.length}/{pagination.totalItems} projects
          </div>
          <div>
            📄 Chunk {nextPageToLoad - 1}/{pagination.totalPages}
          </div>
          <div
            className={
              loading ? 'text-yellow-300' : showSkeletons ? 'text-purple-300' : 'text-green-300'
            }
          >
            {loading
              ? '⏳ Loading...'
              : showSkeletons
                ? '👻 Scrolling...'
                : hasMore
                  ? '✅ Ready'
                  : '🏁 Complete'}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>

      {/* Skeletons - Show when scrolling OR loading */}
      {(showSkeletons || loading) && hasMore && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(limit)].map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="text-center text-sm text-blue-600 animate-pulse">
              ⏳ Loading chunk {nextPageToLoad}...
            </div>
          )}

          {/* Scrolling indicator */}
          {showSkeletons && !loading && (
            <div className="text-center text-sm text-purple-600">
              👻 Scrolling detected - will load when you stop
            </div>
          )}
        </div>
      )}

      {/* Loader - Invisible trigger */}
      {hasMore && <div ref={loaderRef} className="h-10 w-full" />}

      {/* End Message */}
      {!hasMore && projects.length > 0 && (
        <div className="text-center py-8">
          <div className="text-green-600 font-medium text-lg">
            ✅ All {projects.length} projects loaded!
          </div>
          <div className="text-sm text-gray-500 mt-1">Loaded in {pagination.totalPages} chunks</div>
        </div>
      )}

      {/* Debug Panel */}
      <div className="fixed bottom-2 right-2 bg-black text-white text-xs p-2 rounded opacity-70">
        <div>
          Projects: {projects.length}/{pagination.totalItems}
        </div>
        <div>
          Chunk: {nextPageToLoad - 1}/{pagination.totalPages}
        </div>
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>Skeletons: {showSkeletons ? 'Yes' : 'No'}</div>
        <div>Has More: {hasMore ? 'Yes' : 'No'}</div>
        <div className="text-yellow-300 mt-1">👻 Skeletons show on scroll</div>
      </div>
    </div>
  );
}
