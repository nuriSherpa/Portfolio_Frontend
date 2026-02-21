// src/app/(public)/projects/[slug]/loading.tsx
export default function ProjectLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Project Header - matches actual page structure */}
      <div className="border-b border-grey-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Link - exact match */}
          <div className="inline-flex items-center gap-2 text-grey-600 mb-8">
            <div className="w-4 h-4 bg-grey-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-grey-200 rounded animate-pulse" />
          </div>

          {/* Title - exact match with RED color hint */}
          <div className="h-10 md:h-12 lg:h-14 w-3/4 bg-grey-200 rounded animate-pulse mb-4" />

          {/* Meta - exact match with RED color hint */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="h-5 w-24 bg-grey-200 rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-grey-200 rounded animate-pulse" />
              <div className="h-5 w-28 bg-grey-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Image - exact match with fallback option */}
          <div className="relative aspect-video bg-grey-100 mb-8 animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-grey-200 rounded" />
            </div>
          </div>

          {/* Description - exact match */}
          <div className="space-y-3 max-w-2xl">
            <div className="h-5 w-full bg-grey-200 rounded animate-pulse" />
            <div className="h-5 w-full bg-grey-200 rounded animate-pulse" />
            <div className="h-5 w-2/3 bg-grey-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content Section - exact match with all elements */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Technologies - now included */}
        <div className="mb-12">
          <div className="h-4 w-24 bg-grey-200 rounded animate-pulse mb-4" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-16 bg-grey-200 rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Buttons - now included */}
        <div className="flex flex-wrap gap-4">
          <div className="h-12 w-40 bg-grey-200 rounded animate-pulse" />
          <div className="h-12 w-36 bg-grey-200 rounded animate-pulse border-2 border-grey-200" />
        </div>
      </div>
    </div>
  );
}
