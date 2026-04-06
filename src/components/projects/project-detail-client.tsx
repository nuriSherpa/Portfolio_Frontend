// src/components/projects/project-detail-client.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils/image-url';
import { ArrowLeft, Calendar, Github, ExternalLink, Eye, CalendarCheck } from 'lucide-react';
import { ExpandableDescription } from './expandable-description';
import { globalCache } from '@/lib/cache/cache';

interface ProjectDetailClientProps {
  project: any;
  slug: string;
  postedDate: string | null;
  completedDate: string | null;
}

const CACHE_FROM_LOCAL_KEY = 'projects-detail-from-local';

function formatDate(dateString: string | undefined | Date | null) {
  if (!dateString) return null;
  const dateStr = typeof dateString === 'string' ? dateString : (dateString as Date).toISOString();
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getInitialState(
  serverProject: any,
  serverPostedDate: string | null,
  serverCompletedDate: string | null,
  slug: string,
) {
  if (typeof window === 'undefined') {
    return {
      project: serverProject,
      postedDate: serverPostedDate,
      completedDate: serverCompletedDate,
      fromCache: false,
    };
  }

  try {
    const raw = sessionStorage.getItem(CACHE_FROM_LOCAL_KEY);
    if (raw) {
      sessionStorage.removeItem(CACHE_FROM_LOCAL_KEY);
      const { slug: cachedSlug, data } = JSON.parse(raw);
      if (cachedSlug === slug && data) {
        return {
          project: data,
          postedDate: formatDate(data.publishedAt),
          completedDate: formatDate(data.projectCompletionDate),
          fromCache: true,
        };
      }
    }
  } catch (_) {}

  return {
    project: serverProject,
    postedDate: serverPostedDate,
    completedDate: serverCompletedDate,
    fromCache: false,
  };
}

export function ProjectDetailClient({
  project: serverProject,
  slug,
  postedDate: serverPostedDate,
  completedDate: serverCompletedDate,
}: ProjectDetailClientProps) {
  const router = useRouter();

  const [{ project, postedDate, completedDate, fromCache }] = useState(() =>
    getInitialState(serverProject, serverPostedDate, serverCompletedDate, slug),
  );

  const imageUrl = project.projectImage ? getImageUrl(project.projectImage) : null;

  // fromCache = navigated from prefetched card → image already preloaded → show instantly
  // no imageUrl = nothing to wait for → show instantly
  // fresh/direct visit → image starts hidden, fades in on load
  const [imageReady, setImageReady] = useState(fromCache || !imageUrl);
  const hasSavedToCache = useRef(false);

  useEffect(() => {
    if (hasSavedToCache.current) return;
    hasSavedToCache.current = true;
    const cacheKey = `project-detail-${slug}`;
    globalCache.get(cacheKey).then((existing) => {
      if (!existing) {
        globalCache.set(cacheKey, serverProject, 1000 * 60 * 60);
      }
    });
  }, [slug, serverProject]);

  // Safety net: never stay hidden more than 2s
  useEffect(() => {
    if (imageReady) return;
    const t = setTimeout(() => setImageReady(true), 2000);
    return () => clearTimeout(t);
  }, [imageReady]);

  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else window.location.href = '/projects';
  };

  return (
    <div className="w-[80%] mx-auto pb-20">
      {/* Back button */}
      <div className="pt-12 mb-8">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-grey-600 hover:text-red transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>
      </div>

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
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-red mb-4">{project.title}</h1>

      {/* Status */}
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

      {/* Image and Content */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {imageUrl && (
          <div className="lg:w-1/2">
            <div className="relative aspect-[4/3] bg-grey-100 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={imageUrl}
                alt={project.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        )}

        <div className="lg:w-1/2 flex flex-col min-h-[300px] lg:min-h-0">
          <div>
            <h2 className="text-2xl font-bold text-grey-900 mb-4">About the Project</h2>
            <ExpandableDescription description={project.description} />
          </div>

          {project.technologies && project.technologies.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-grey-900 mb-3">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech: any, index: number) => (
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
  );
}
