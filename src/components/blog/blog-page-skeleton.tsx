import { BlogCardSkeleton } from './blog-card-skeleton';

export function BlogPageSkeleton() {
  return (
    <div className="w-full pb-20 space-y-8">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-10 w-32 bg-grey-100 rounded-lg animate-pulse" />
        <div className="h-6 w-2/3 bg-grey-100 rounded animate-pulse" />
      </div>

      {/* Search Skeleton */}
      <div className="h-14 w-full bg-grey-100 rounded-xl animate-pulse" />

      {/* Tags Skeleton */}
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-24 bg-grey-100 rounded-full animate-pulse" />
        ))}
      </div>

      {/* Cards Skeleton */}
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
