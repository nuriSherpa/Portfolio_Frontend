// src/app/(public)/projects/[slug]/loading.tsx
export default function ProjectLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Back button - 80% width like actual page */}
      <div className="w-[80%] mx-auto pt-12">
        <div className="inline-flex items-center gap-2 text-grey-600 mb-8">
          <div className="w-4 h-4 bg-grey-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-grey-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Main Content - 80% width */}
      <div className="w-[80%] mx-auto pb-20">
        {/* Posted Date and Views */}
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-grey-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-grey-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-grey-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-grey-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div className="h-8 md:h-10 lg:h-12 w-3/4 bg-grey-200 rounded animate-pulse mb-4" />

        {/* Status and Completion Date */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="h-6 w-20 bg-grey-200 rounded-full animate-pulse" />
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-grey-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-grey-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Excerpt */}
        <div className="mb-10">
          <div className="h-5 w-full bg-grey-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-5/6 bg-grey-200 rounded animate-pulse" />
        </div>

        {/* Image and Content - Side by side on desktop */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Image skeleton - 50% on desktop */}
          <div className="lg:w-1/2">
            <div className="aspect-[4/3] bg-grey-200 rounded-lg animate-pulse" />
          </div>

          {/* Content skeleton - 50% on desktop */}
          <div className="lg:w-1/2 flex flex-col">
            {/* About the Project heading */}
            <div className="h-7 w-48 bg-grey-200 rounded animate-pulse mb-4" />

            {/* Description lines */}
            <div className="space-y-2 mb-6">
              <div className="h-4 w-full bg-grey-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-grey-200 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-grey-200 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-grey-200 rounded animate-pulse" />
            </div>

            {/* Read More button skeleton */}
            <div className="h-6 w-24 bg-grey-200 rounded animate-pulse mb-8" />

            {/* Technologies heading */}
            <div className="h-5 w-36 bg-grey-200 rounded animate-pulse mb-3" />

            {/* Technology tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-7 w-16 bg-grey-200 rounded-full animate-pulse" />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <div className="h-11 w-full sm:w-40 bg-grey-200 rounded-lg animate-pulse" />
              <div className="h-11 w-full sm:w-36 bg-grey-200 rounded-lg animate-pulse border-2 border-grey-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
