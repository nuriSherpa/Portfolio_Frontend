// src/app/(public)/projects/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import { getProjects } from '@/lib/api/actions/projects';
import { ProjectsGrid } from '@/components/projects/project-grid';
import { PageSkeleton } from '@/components/shared/page-skeleton';

export const metadata: Metadata = {
  title: 'Projects | Portfolio',
  description: 'View my latest projects and work',
};

const PROJECTS_PER_PAGE = 6;

export default async function ProjectsPage() {
  // Only fetch first 6, not all
  const result = await getProjects({ page: 1, limit: PROJECTS_PER_PAGE });

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-black mb-4">Featured Projects</h1>
          <p className="text-lg text-grey-600">A selection of my recent work</p>
        </div>

        <Suspense fallback={<PageSkeleton type="projects" />}>
          <ProjectsGrid
            initialProjects={result.projects}
            initialPagination={result.pagination}
            limit={PROJECTS_PER_PAGE}
          />
        </Suspense>
      </div>
    </main>
  );
}
