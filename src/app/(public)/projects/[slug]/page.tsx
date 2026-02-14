// src/app/(public)/projects/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProjectBySlug, getProjects } from '@/lib/api/actions/projects';
import { LazyImage } from '@/components/shared/lazy-image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Github, ExternalLink } from 'lucide-react';
import { Suspense } from 'react';

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>; // ← params is now a Promise
}): Promise<Metadata> {
  const { slug } = await params; // ← await params
  const { project } = await getProjectBySlug(slug);

  if (!project) {
    return { title: 'Project Not Found' };
  }

  return {
    title: `${project.title} | Projects`,
    description: project.excerpt,
  };
}

// Generate static params
export async function generateStaticParams() {
  const { projects } = await getProjects();

  return projects.map((project) => ({
    slug: project.slug,
  }));
}

const fixUrl = (url: string) => url?.replace(/&#x2F;/g, '/') || '';

const statusLabels: Record<string, string> = {
  planning: 'Planning',
  'in-progress': 'In Progress',
  completed: 'Completed',
  archived: 'Archived',
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>; // ← params is now a Promise
}) {
  const { slug } = await params; // ← await params
  const { project, error } = await getProjectBySlug(slug);

  if (!project || error) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back link */}
      <div className="container mx-auto px-4 py-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-grey-600 hover:text-red"
        >
          <ArrowLeft size={20} />
          Back to Projects
        </Link>
      </div>

      {/* Hero Image with Suspense */}
      <Suspense fallback={<div className="h-64 lg:h-96 bg-grey-200 animate-pulse" />}>
        <div className="relative h-64 lg:h-96 w-full bg-grey-100">
          <LazyImage
            src={fixUrl(project.imageUrl)}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </Suspense>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Status */}
          <span className="inline-block px-3 py-1 bg-grey-100 text-grey-700 rounded-full text-sm mb-4">
            {statusLabels[project.projectStatus]}
          </span>

          <h1 className="text-3xl lg:text-4xl font-bold text-black mb-4">{project.title}</h1>

          <p className="text-lg text-grey-600 mb-8">{project.description}</p>

          {/* Technologies */}
          {project.technologies?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-black mb-3">Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech.name}
                    className="px-3 py-1 bg-grey-50 text-grey-700 rounded-lg text-sm"
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex gap-4">
            {project.projectUrl && (
              <a
                href={fixUrl(project.projectUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Github size={20} />
                View Code
                <ExternalLink size={16} />
              </a>
            )}
          </div>

          {/* Date */}
          {project.projectCompletionDate && (
            <div className="mt-8 pt-8 border-t border-grey-200 flex items-center gap-2 text-grey-500">
              <Calendar size={16} />
              Completed: {new Date(project.projectCompletionDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
