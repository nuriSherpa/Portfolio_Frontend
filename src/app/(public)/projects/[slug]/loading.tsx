// src/app/(public)/projects/[slug]/loading.tsx
export default function ProjectLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-64 lg:h-96 bg-grey-200 animate-pulse" />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-8 w-32 bg-grey-200 rounded animate-pulse" />
          <div className="h-10 w-3/4 bg-grey-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-grey-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-grey-200 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-grey-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
