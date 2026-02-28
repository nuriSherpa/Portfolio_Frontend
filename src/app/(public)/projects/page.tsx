// src/app/(public)/projects/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import { getProjects } from '@/lib/api/actions/projects';
import { ProjectsGrid } from '@/components/projects/project-grid';
import { ProjectsPageSkeleton } from '@/components/projects/projects-page-skeleton';

export const metadata: Metadata = {
  title: 'Projects | Portfolio',
  description: 'Explore my latest projects and work',
};

export const revalidate = 3600;

// This component fetches data AND renders header + grid
async function ProjectsContent() {
  const { projects, pagination } = await getProjects(6, 1);

  return (
    <>
      {/* Header - Only shows after data is loaded */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-red mb-2">Projects</h1>
        <p className="text-lg text-grey-600 max-w-2xl">
          A collection of my recent work, side projects, and experiments.
        </p>
      </div>

      {/* Grid */}
      <ProjectsGrid initialProjects={projects} initialPagination={pagination} limit={6} />
    </>
  );
}

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="w-[80%] mx-auto">
        {/* Suspense covers everything - shows skeleton for entire content area */}
        <Suspense fallback={<ProjectsPageSkeleton />}>
          <ProjectsContent />
        </Suspense>
      </div>
    </main>
  );
}
