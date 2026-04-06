// src/app/(public)/projects/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getProjectBySlug } from '@/lib/api/actions/projects';
import { ProjectDetailClient } from '@/components/projects/project-detail-client';

type Props = {
  params: Promise<{ slug: string }>;
};

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
  const { slug } = await params;
  if (!slug) notFound();

  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-white">
      <ProjectDetailClient
        project={project}
        slug={slug}
        postedDate={formatDate(project.publishedAt)}
        completedDate={formatDate(project.projectCompletionDate)}
      />
    </div>
  );
}
