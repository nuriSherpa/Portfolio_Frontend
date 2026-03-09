// src/app/(public)/projects/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { ArrowLeft, Calendar, Github, ExternalLink, Eye, CalendarCheck } from 'lucide-react';
import { getProjectBySlug } from '@/lib/api/actions/projects';

import { ProjectDetailClient } from '@/components/projects/project-detail-client';

// Props type for Next.js 15
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
  // Server-side: await params (Next.js 15)
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  // Server fetch (uses server cache - cachedFetch)
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const postedDate = formatDate(project.publishedAt);
  const completedDate = formatDate(project.projectCompletionDate);

  return (
    <div className="min-h-screen bg-white">
      {/* Client component handles local cache hydration */}
      <ProjectDetailClient
        project={project}
        slug={slug}
        postedDate={postedDate}
        completedDate={completedDate}
      />
    </div>
  );
}
