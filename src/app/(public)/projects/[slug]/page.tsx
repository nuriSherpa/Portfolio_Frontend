// src/app/(public)/projects/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Github, ExternalLink } from 'lucide-react';
import { getProjects, getProjectBySlug } from '@/lib/api/actions/projects';

interface Props {
  params: { slug: string };
}

// SSG: Generate all project pages at build time
export async function generateStaticParams() {
  const projects = await getProjects(100);
  return projects.map((p) => ({ slug: p.slug }));
}

// ISR: Revalidate individual pages
export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return { title: 'Project Not Found' };

  return {
    title: `${project.title} | Projects`,
    description: project.excerpt,
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = await getProjectBySlug(params.slug);

  if (!project) notFound();

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-grey-200">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-grey-600 hover:text-red mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-red mb-4">
            {project.title}
          </h1>

          {project.projectStatus && (
            <span className="text-red font-medium uppercase tracking-wide text-sm">
              {project.projectStatus}
            </span>
          )}

          {project.projectImage && (
            <div className="relative aspect-video bg-grey-100 my-8">
              <img
                src={project.projectImage}
                alt={project.title}
                className="w-full h-full object-cover"
                width={1200}
                height={675}
                priority
              />
            </div>
          )}

          <p className="text-lg text-grey-600 leading-relaxed">{project.description}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {project.technologies?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-sm font-bold text-grey-900 uppercase tracking-wide mb-4">
              Technologies
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span key={tech.name} className="px-3 py-1 bg-grey-100 text-grey-800 text-sm">
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-grey-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Live Project
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-black text-black hover:bg-red hover:text-white hover:border-red transition-colors"
            >
              <Github className="w-4 h-4" />
              View Code
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
