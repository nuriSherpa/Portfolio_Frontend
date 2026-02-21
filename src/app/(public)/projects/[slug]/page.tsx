// src/app/(public)/projects/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProjectBySlug, getProjects } from '@/lib/api/actions/projects';
import Link from 'next/link';
import { ArrowLeft, Calendar, Github, ExternalLink, ImageOff } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { projects } = await getProjects();
  if (!projects?.length) return [];
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) return { title: 'Project Not Found' };

  const { project } = await getProjectBySlug(slug);
  if (!project) return { title: 'Project Not Found' };

  return {
    title: `${project.title} | Projects`,
    description: project.excerpt || project.metaDescription,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  const { project, success } = await getProjectBySlug(slug);
  if (!success || !project) notFound();

  const hasImage = project.projectImage?.trim() !== '';

  return (
    <div className="min-h-screen bg-white">
      {/* Project Header */}
      <div className="border-b border-grey-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Link */}
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-grey-600 hover:text-red mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>

          {/* Title - RED */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-red mb-4">
            {project.title}
          </h1>

          {/* Meta - RED */}
          <div className="flex flex-wrap gap-4 mb-8">
            {project.projectStatus && (
              <span className="text-red font-medium uppercase tracking-wide text-sm">
                {project.projectStatus}
              </span>
            )}
            {project.projectCompletionDate && (
              <span className="flex items-center gap-2 text-red">
                <Calendar className="w-4 h-4" />
                {new Date(project.projectCompletionDate).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Image */}
          {hasImage ? (
            <div className="relative aspect-video bg-grey-100 mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.projectImage}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-grey-100 flex items-center justify-center mb-8">
              <ImageOff className="w-12 h-12 text-grey-400" />
            </div>
          )}

          {/* Description - Only once */}
          <p className="text-lg text-grey-600 leading-relaxed max-w-2xl">{project.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Technologies */}
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

        {/* Buttons - BLACK & RED */}
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
