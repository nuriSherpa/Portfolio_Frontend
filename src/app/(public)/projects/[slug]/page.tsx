// src/app/(public)/projects/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils/image-url';
import { ArrowLeft, Calendar, Github, ExternalLink, Eye, CalendarCheck } from 'lucide-react';
import { getProjectBySlug } from '@/lib/api/actions/projects';
import { ExpandableDescription } from '@/components/projects/expandable-description';

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

export const revalidate = 3600;

function formatDate(dateString: string | undefined | Date) {
  if (!dateString) return null;
  const dateStr = typeof dateString === 'string' ? dateString : dateString.toISOString();
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function ProjectPage({ params }: Props) {
  try {
    const { slug } = await params;
    const project = await getProjectBySlug(slug);

    if (!project) {
      notFound();
    }

    const postedDate = formatDate(project.publishedAt);
    const completedDate = formatDate(project.projectCompletionDate);

    return (
      <div className="min-h-screen bg-white">
        {/* Back button - 80% width */}
        <div className="w-[80%] mx-auto pt-12">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-grey-600 hover:text-red mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>

        {/* Main Content - 80% width */}
        <div className="w-[80%] mx-auto pb-20">
          {/* Posted Date and Views */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-grey-500 mb-3">
            {postedDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Posted on {postedDate}</span>
              </div>
            )}
            {typeof project.views === 'number' && project.views > 0 && (
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>{project.views} views</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-red mb-4">
            {project.title}
          </h1>

          {/* Status and Completion Date */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="bg-red text-white px-3 py-1 rounded-full text-xs font-medium">
              {project.projectStatus?.replace('-', ' ') || 'in progress'}
            </span>
            {completedDate && (
              <div className="flex items-center gap-1.5 text-sm text-grey-600">
                <CalendarCheck className="w-4 h-4" />
                <span>Completed: {completedDate}</span>
              </div>
            )}
          </div>

          {/* Excerpt */}
          {project.excerpt && (
            <p className="text-lg text-grey-700 italic border-l-4 border-red pl-4 py-2 bg-grey-50 mb-10">
              {project.excerpt}
            </p>
          )}

          {/* Image and Content - Side by side */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Image - 50% on desktop, maintains aspect ratio */}
            {project.projectImage && (
              <div className="lg:w-1/2">
                <div className="relative aspect-[4/3] bg-grey-100 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={getImageUrl(project.projectImage)}
                    alt={project.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            )}

            {/* Content - 50% on desktop with flex column and min height to match image */}
            <div className="lg:w-1/2 flex flex-col min-h-[300px] lg:min-h-0">
              {/* Description section */}
              <div>
                <h2 className="text-2xl font-bold text-grey-900 mb-4">About the Project</h2>
                <ExpandableDescription description={project.description} />
              </div>

              {/* Technologies section */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-grey-900 mb-3">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={`${tech.name}-${index}`}
                        className="text-xs px-3 py-1.5 bg-grey-100 rounded-full text-grey-700 font-medium"
                      >
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Button section - using mt-auto to push to bottom */}
              {(project.projectUrl || project.githubUrl) && (
                <div className="mt-auto pt-8">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {project.projectUrl && (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white hover:bg-red transition-colors rounded-lg font-medium w-full sm:w-auto sm:min-w-[180px]"
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
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-black text-black hover:bg-red hover:text-white hover:border-red transition-colors rounded-lg font-medium w-full sm:w-auto sm:min-w-[180px]"
                      >
                        <Github className="w-4 h-4" />
                        View Source Code
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading project:', error);
    notFound();
  }
}
