export function BlogCardSkeleton() {
  return (
    <div className="bg-white border border-grey-100 rounded-xl overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Image Skeleton */}
        <div className="w-full md:w-2/5 lg:w-1/3 aspect-[16/10] md:aspect-auto md:min-h-[280px] bg-grey-100 animate-pulse" />

        {/* Text Skeleton */}
        <div className="flex-1 p-6 md:p-8 space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-grey-100 rounded-md animate-pulse" />
            <div className="h-6 w-16 bg-grey-100 rounded-md animate-pulse" />
          </div>

          <div className="h-8 w-3/4 bg-grey-100 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-grey-100 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-grey-100 rounded animate-pulse" />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-grey-100">
            <div className="h-4 w-24 bg-grey-100 rounded animate-pulse" />
            <div className="h-4 w-24 bg-grey-100 rounded animate-pulse" />
            <div className="h-4 w-20 bg-grey-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
