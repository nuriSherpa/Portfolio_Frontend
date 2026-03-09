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

async function ProjectsContent() {
  // This should use server cache
  console.log('[Server] Fetching projects...');
  const { projects, pagination } = await getProjects(6, 1);
  console.log(`[Server] Got ${projects.length} projects`);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-red mb-2">Projects</h1>
        <p className="text-lg text-grey-600 max-w-2xl">
          A collection of my recent work, side projects, and experiments.
        </p>
      </div>
      <ProjectsGrid initialProjects={projects} initialPagination={pagination} limit={6} />
    </>
  );
}

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="w-[80%] mx-auto">
        <Suspense fallback={<ProjectsPageSkeleton />}>
          <ProjectsContent />
        </Suspense>
      </div>
    </main>
  );
}
