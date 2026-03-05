// src/components/about/about-skeleton.tsx
export function AboutSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full pb-20">
        <div className="w-full flex justify-center">
          <div className="w-[80%] max-w-6xl">
            <div className="space-y-6">
              {/* Top gap */}
              <div className="w-full h-0" />

              {/* Banner + Profile Skeleton - Single Card */}
              <div className="bg-white shadow-sm animate-pulse">
                {/* Banner */}
                <div className="h-[150px] sm:h-[180px] md:h-[240px] lg:h-[280px] w-full bg-grey-100" />

                {/* Profile Content */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-6">
                    {/* Avatar */}
                    <div className="flex justify-center md:justify-start flex-shrink-0">
                      <div className="relative -mt-12 sm:-mt-14 md:-mt-16 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 rounded-full bg-grey-100 border-4 border-white" />
                    </div>

                    {/* Text Lines */}
                    <div className="flex-1 space-y-3 pt-2">
                      <div className="h-7 sm:h-8 md:h-9 bg-grey-100 rounded w-3/4 mx-auto md:mx-0" />
                      <div className="h-4 sm:h-5 bg-grey-100 rounded w-1/2 mx-auto md:mx-0" />
                      <div className="h-3 sm:h-4 bg-grey-100 rounded w-full max-w-md mx-auto md:mx-0" />

                      {/* Social icons row */}
                      <div className="flex justify-center md:justify-start gap-2 pt-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-grey-100" />
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-grey-100" />
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-grey-100" />
                      </div>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-grey-100 space-y-2">
                    <div className="h-4 bg-grey-100 rounded w-16" />
                    <div className="h-3 sm:h-4 bg-grey-100 rounded w-full" />
                    <div className="h-3 sm:h-4 bg-grey-100 rounded w-5/6" />
                    <div className="h-3 sm:h-4 bg-grey-100 rounded w-4/6" />
                  </div>
                </div>
              </div>

              {/* Section Cards - Just one line each */}
              <SkeletonCard lines={1} />
              <SkeletonCard lines={1} />
              <SkeletonCard lines={1} />
              <SkeletonCard lines={1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable simple card skeleton
function SkeletonCard({ lines = 1 }: { lines?: number }) {
  return (
    <div className="bg-white shadow-sm p-4 sm:p-5 md:p-6 animate-pulse">
      <div className="h-4 sm:h-5 bg-grey-100 rounded w-24 mb-3" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 sm:h-4 bg-grey-100 rounded w-full" />
        ))}
      </div>
    </div>
  );
}
