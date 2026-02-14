// src/app/(public)/loading.tsx
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12 lg:py-20">
      <div className="flex flex-col items-center">
        {/* Profile Image Skeleton */}
        <div className="mb-10 lg:mb-12 relative w-48 h-48 lg:w-56 lg:h-56">
          <div className="absolute inset-0 rounded-full border-3 border-grey-200 p-1">
            <div className="w-full h-full rounded-full bg-grey-200 animate-pulse" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="mb-10 flex justify-center gap-8 lg:gap-12">
          {/* Visitors */}
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-grey-200 rounded animate-pulse" />
            <div>
              <div className="h-8 w-16 bg-grey-200 rounded animate-pulse mb-1" />
              <div className="h-4 w-12 bg-grey-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Projects */}
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-grey-200 rounded animate-pulse" />
            <div>
              <div className="h-8 w-12 bg-grey-200 rounded animate-pulse mb-1" />
              <div className="h-4 w-14 bg-grey-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Likes */}
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-grey-200 rounded animate-pulse" />
            <div>
              <div className="h-8 w-14 bg-grey-200 rounded animate-pulse mb-1" />
              <div className="h-4 w-10 bg-grey-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Name Skeleton */}
        <div className="h-10 lg:h-14 bg-grey-200 rounded w-64 lg:w-80 mb-6 animate-pulse" />

        {/* Title Skeleton */}
        <div className="h-7 lg:h-9 bg-grey-200 rounded w-48 lg:w-64 mb-8 lg:mb-10 animate-pulse" />

        {/* Bio Skeleton */}
        <div className="max-w-2xl w-full px-4 lg:px-8 mb-10 lg:mb-12 space-y-2">
          <div className="h-5 lg:h-6 bg-grey-200 rounded w-full animate-pulse" />
          <div className="h-5 lg:h-6 bg-grey-200 rounded w-3/4 mx-auto animate-pulse" />
        </div>

        {/* Social Links Skeleton */}
        <div className="flex justify-center gap-5 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-grey-200 bg-grey-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
