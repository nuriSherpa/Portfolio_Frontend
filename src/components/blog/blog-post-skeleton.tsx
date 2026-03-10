export function BlogPostSkeleton() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="w-[80%] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-grey-100 rounded-full animate-pulse" />
                <div className="h-6 w-16 bg-grey-100 rounded-full animate-pulse" />
              </div>
              <div className="h-12 w-3/4 bg-grey-100 rounded-lg animate-pulse" />
              <div className="flex gap-4">
                <div className="h-4 w-32 bg-grey-100 rounded animate-pulse" />
                <div className="h-4 w-24 bg-grey-100 rounded animate-pulse" />
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="aspect-video bg-grey-100 rounded-xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 w-full bg-grey-100 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-grey-100 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-grey-100 rounded animate-pulse" />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="h-40 bg-grey-100 rounded-xl animate-pulse" />
            <div className="h-32 bg-grey-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
