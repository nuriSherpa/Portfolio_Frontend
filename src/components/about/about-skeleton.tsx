// src/components/about/about-skeleton.tsx
export function AboutSkeleton() {
  return (
    <div className="w-full pb-20">
      <div className="space-y-8 mt-12">
        {/* Banner + Profile Section */}
        <div className="bg-white shadow-sm">
          {/* Banner */}
          <div className="relative h-[150px] sm:h-[180px] md:h-[240px] lg:h-[280px] w-full bg-grey-100 animate-pulse" />

          <div className="p-4 sm:p-5">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {/* Profile Image */}
              <div className="flex justify-center md:justify-start flex-shrink-0">
                <div className="relative -mt-12 sm:-mt-14 md:-mt-16 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 rounded-full bg-grey-100 border-4 border-white shadow-sm animate-pulse" />
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4">
                  <div className="space-y-1 flex-1">
                    {/* Name */}
                    <div className="h-7 sm:h-8 md:h-9 lg:h-10 bg-grey-100 rounded w-48 sm:w-56 md:w-64 mx-auto md:mx-0 animate-pulse" />
                    {/* Job Title */}
                    <div className="h-5 sm:h-6 md:h-7 bg-grey-100 rounded w-32 sm:w-40 md:w-48 mx-auto md:mx-0 mt-1 animate-pulse" />
                    {/* Headline */}
                    <div className="h-4 sm:h-5 md:h-6 bg-grey-100 rounded w-full max-w-2xl mx-auto md:mx-0 mt-2 animate-pulse" />
                  </div>

                  {/* Social Icons */}
                  <div className="flex flex-col items-center md:items-end gap-3 mt-4 md:mt-0">
                    <div className="flex items-center justify-center md:justify-end gap-4 sm:gap-5">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-grey-100 border border-grey-200 animate-pulse" />
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-grey-100 border border-grey-200 animate-pulse" />
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-grey-100 border border-grey-200 animate-pulse" />
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-grey-100 border border-grey-200 animate-pulse" />
                    </div>
                    {/* Alumni placeholder */}
                    <div className="h-4 bg-grey-100 rounded w-40 mt-2 animate-pulse" />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-3">
                  <div className="h-4 sm:h-5 bg-grey-100 rounded w-28 animate-pulse" />
                  <div className="h-4 sm:h-5 bg-grey-100 rounded w-24 animate-pulse" />
                  <div className="h-4 sm:h-5 bg-grey-100 rounded w-28 animate-pulse" />
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mt-6">
                  <div className="h-12 sm:h-14 bg-grey-100 rounded-lg w-full sm:w-auto sm:min-w-[180px] animate-pulse" />
                  <div className="h-12 sm:h-14 bg-grey-100 rounded-lg w-full sm:w-auto sm:min-w-[180px] border-2 border-grey-100 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-grey-100">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-grey-100 rounded animate-pulse" />
                <div className="h-5 sm:h-6 bg-grey-100 rounded w-16 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-3 sm:h-4 bg-grey-100 rounded w-full animate-pulse" />
                <div className="h-3 sm:h-4 bg-grey-100 rounded w-full animate-pulse" />
                <div className="h-3 sm:h-4 bg-grey-100 rounded w-5/6 animate-pulse" />
                <div className="h-3 sm:h-4 bg-grey-100 rounded w-4/6 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Current Work Card */}
        <div className="bg-white shadow-sm p-4 sm:p-5 md:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-grey-100 rounded animate-pulse" />
            <div className="h-5 sm:h-6 bg-grey-100 rounded w-32 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-grey-100 rounded flex-shrink-0 animate-pulse" />
            <div className="space-y-1">
              <div className="h-3 sm:h-4 bg-grey-100 rounded w-24 animate-pulse" />
              <div className="h-4 sm:h-5 bg-grey-100 rounded w-40 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Skills Card */}
        <div className="bg-white shadow-sm p-4 sm:p-5 md:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-grey-100 rounded animate-pulse" />
            <div className="h-5 sm:h-6 bg-grey-100 rounded w-16 animate-pulse" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-grey-100 rounded animate-pulse" />
                  <div className="h-4 sm:h-5 bg-grey-100 rounded w-20 animate-pulse" />
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div
                      key={j}
                      className="h-6 sm:h-7 bg-grey-100 rounded-full w-20 sm:w-24 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Card */}
        <div className="bg-white shadow-sm p-4 sm:p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-grey-100 rounded animate-pulse" />
            <div className="h-5 sm:h-6 bg-grey-100 rounded w-24 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-grey-100 rounded flex-shrink-0 animate-pulse" />
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="h-4 sm:h-5 bg-grey-100 rounded w-full animate-pulse" />
                  <div className="h-3 sm:h-4 bg-grey-100 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-grey-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education Card */}
        <div className="bg-white shadow-sm p-4 sm:p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-grey-100 rounded animate-pulse" />
            <div className="h-5 sm:h-6 bg-grey-100 rounded w-24 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-grey-100 rounded flex-shrink-0 animate-pulse" />
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="h-4 sm:h-5 bg-grey-100 rounded w-full animate-pulse" />
                  <div className="h-3 sm:h-4 bg-grey-100 rounded w-full animate-pulse" />
                  <div className="h-3 bg-grey-100 rounded w-1/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications Card */}
        <div className="bg-white shadow-sm p-4 sm:p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-grey-100 rounded animate-pulse" />
            <div className="h-5 sm:h-6 bg-grey-100 rounded w-32 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 p-3 border border-grey-100 rounded-sm w-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-grey-100 rounded flex-shrink-0 animate-pulse" />
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="h-4 sm:h-5 bg-grey-100 rounded w-full animate-pulse" />
                  <div className="h-3 sm:h-4 bg-grey-100 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-grey-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Languages Card */}
        <div className="bg-white shadow-sm p-4 sm:p-5 md:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-grey-100 rounded animate-pulse" />
            <div className="h-5 sm:h-6 bg-grey-100 rounded w-24 animate-pulse" />
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-7 sm:h-8 bg-grey-100 rounded-full w-24 sm:w-28 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
