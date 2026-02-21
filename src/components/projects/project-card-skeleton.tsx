// src/components/projects/project-card-skeleton.tsx
export function ProjectCardSkeleton() {
  return (
    <div
      className="bg-white border border-grey-200 rounded-lg overflow-hidden h-full"
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Image skeleton with pulse animation */}
      <div className="relative w-full bg-grey-100" style={{ aspectRatio: '16/9' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="p-5 space-y-3">
        <div className="h-5 bg-grey-100 rounded w-3/4 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-grey-100 rounded animate-pulse" />
          <div className="h-4 bg-grey-100 rounded w-5/6 animate-pulse" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-6 bg-grey-100 rounded-full w-16 animate-pulse" />
          <div className="h-6 bg-grey-100 rounded-full w-20 animate-pulse" />
          <div className="h-6 bg-grey-100 rounded-full w-14 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
