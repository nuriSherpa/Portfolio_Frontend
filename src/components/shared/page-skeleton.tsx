// components/shared/page-skeleton.tsx
interface PageSkeletonProps {
  type: 'hero' | 'projects' | 'blog' | 'about' | 'default';
}

export function PageSkeleton({ type }: PageSkeletonProps) {
  const skeletons = {
    hero: (
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="flex flex-col items-center animate-pulse">
          {/* Profile image */}
          <div className="mb-10 lg:mb-12 w-48 h-48 lg:w-56 lg:h-56 rounded-full bg-grey-200"></div>

          {/* Stats */}
          <div className="mb-10 flex gap-8 lg:gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-grey-200 rounded"></div>
                <div className="space-y-1">
                  <div className="h-6 w-12 bg-grey-200 rounded"></div>
                  <div className="h-3 w-10 bg-grey-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Name */}
          <div className="h-10 lg:h-14 bg-grey-200 rounded w-56 lg:w-72 mb-6"></div>

          {/* Title */}
          <div className="h-7 lg:h-9 bg-grey-200 rounded w-40 lg:w-56 mb-8 lg:mb-10"></div>

          {/* Bio - single line */}
          <div className="h-5 lg:h-6 bg-grey-200 rounded w-full max-w-xl mb-10 lg:mb-12"></div>

          {/* Social icons - 4 items */}
          <div className="flex gap-5 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-11 h-11 lg:w-13 lg:h-13 rounded-full bg-grey-200"></div>
            ))}
          </div>
        </div>
      </div>
    ),
    projects: (
      <div className="container mx-auto px-4 py-20">
        <div className="h-8 w-48 bg-grey-200 animate-pulse mb-8" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-grey-200 animate-pulse" />
          ))}
        </div>
      </div>
    ),
    blog: (
      <div className="container mx-auto px-4 py-20">
        <div className="h-8 w-48 bg-grey-200 animate-pulse mb-8" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-grey-200 animate-pulse" />
          ))}
        </div>
      </div>
    ),
    about: (
      <div className="container mx-auto px-4 py-20">
        <div className="h-8 w-48 bg-grey-200 animate-pulse mb-8" />
        <div className="h-64 w-64 bg-grey-200 animate-pulse rounded-full mx-auto mb-8" />
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="h-4 w-full bg-grey-200 animate-pulse" />
          <div className="h-4 w-full bg-grey-200 animate-pulse" />
          <div className="h-4 w-3/4 bg-grey-200 animate-pulse" />
        </div>
      </div>
    ),
    default: (
      <div className="container mx-auto px-4 py-20">
        <div className="h-8 w-48 bg-grey-200 animate-pulse mb-8" />
        <div className="h-64 bg-grey-200 animate-pulse" />
      </div>
    ),
  };

  return skeletons[type] || skeletons.default;
}
