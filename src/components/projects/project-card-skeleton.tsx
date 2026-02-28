// src/components/projects/project-card-skeleton.tsx
import { memo } from 'react';

export const ProjectCardSkeleton = memo(function ProjectCardSkeleton() {
  return (
    <article className="bg-white border border-grey-200 rounded-lg overflow-hidden animate-pulse h-full flex flex-col">
      {/* Image area - simple grey box */}
      <div className="w-full h-[200px] bg-grey-200"></div>

      {/* Content area */}
      <div className="p-4 space-y-3">
        {/* Title - simple rectangle */}
        <div className="h-5 bg-grey-200 rounded w-3/4"></div>

        {/* Excerpt - 3 lines of text */}
        <div className="space-y-2">
          <div className="h-3.5 bg-grey-200 rounded w-full"></div>
          <div className="h-3.5 bg-grey-200 rounded w-5/6"></div>
          <div className="h-3.5 bg-grey-200 rounded w-4/6"></div>
        </div>

        {/* Tech tags - simple circles/rectangles */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          <div className="h-6 bg-grey-200 rounded-full w-14"></div>
          <div className="h-6 bg-grey-200 rounded-full w-16"></div>
          <div className="h-6 bg-grey-200 rounded-full w-12"></div>
        </div>
      </div>
    </article>
  );
});
