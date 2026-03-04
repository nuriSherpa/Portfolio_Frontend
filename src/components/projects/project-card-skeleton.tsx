// src/components/projects/project-card-skeleton.tsx
export function ProjectCardSkeleton() {
  return (
    <div className="bg-white border border-grey-200 rounded-lg overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="relative w-full bg-grey-100 h-[200px]">
        <div className="absolute top-3 left-3 z-20">
          <div className="w-16 h-5 bg-grey-200 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-4">
        {/* Title skeleton */}
        <div className="h-5 bg-grey-200 rounded w-3/4" />

        {/* Excerpt skeleton - 3 lines */}
        <div className="space-y-2">
          <div className="h-3 bg-grey-200 rounded w-full" />
          <div className="h-3 bg-grey-200 rounded w-5/6" />
          <div className="h-3 bg-grey-200 rounded w-4/6" />
        </div>

        {/* Technology tags skeleton */}
        <div className="flex flex-wrap gap-1.5">
          <div className="h-6 bg-grey-200 rounded-full w-14" />
          <div className="h-6 bg-grey-200 rounded-full w-16" />
          <div className="h-6 bg-grey-200 rounded-full w-12" />
        </div>
      </div>
    </div>
  );
}
