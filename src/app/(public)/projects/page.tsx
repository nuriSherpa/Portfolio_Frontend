// src/app/(public)/projects/page.tsx
import { Metadata } from 'next';
import { getProjects } from '@/lib/api/actions/projects';
import { ProjectsGrid } from '@/components/projects/project-grid';
import { PageError } from '@/components/shared/page-error';

export const metadata: Metadata = {
  title: 'Projects | Portfolio',
  description: 'View my latest projects and work',
};

export default async function ProjectsPage() {
  const { projects, error, success } = await getProjects();

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-black mb-4">Featured Projects</h1>
          <p className="text-lg text-grey-600">A selection of my recent work</p>
        </div>

        {error && <PageError message={error} />}

        <ProjectsGrid projects={projects} />
      </div>
    </main>
  );
}
