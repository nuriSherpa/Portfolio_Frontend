// src/components/projects/projects-page-skeleton.tsx
import { memo } from 'react';
import { ProjectCardSkeleton } from './project-card-skeleton';

export const ProjectsPageSkeleton = memo(function ProjectsPageSkeleton() {
  return (
    <div className="w-full">
      {/* Header Section - Skeleton */}
      <div className="mb-8 space-y-2">
        {/* Title skeleton - matches h1 */}
        <div className="h-10 bg-grey-200 rounded w-32 animate-pulse"></div>
        {/* Subtitle skeleton - matches p */}
        <div className="h-6 bg-grey-200 rounded w-96 max-w-full animate-pulse"></div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-2 mb-8">
        <div className="h-9 w-16 bg-grey-200 rounded-full animate-pulse"></div>
        <div className="h-9 w-20 bg-grey-200 rounded-full animate-pulse"></div>
        <div className="h-9 w-24 bg-grey-200 rounded-full animate-pulse"></div>
        <div className="h-9 w-16 bg-grey-200 rounded-full animate-pulse"></div>
      </div>

      {/* Projects Grid - 6 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </div>

      {/* Loader space */}
      <div className="h-20 w-full"></div>
    </div>
  );
});
