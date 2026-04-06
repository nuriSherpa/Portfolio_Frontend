// src/components/projects/project-card.tsx
'use client';

import { ExternalLink } from 'lucide-react';
import { Project } from '@/lib/types/models';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils/image-url';
import { useSmartPrefetch } from '@/hooks/use-smart-prefetch';
import { useCachedNavigation } from '@/hooks/use-cached-navigation';

interface ProjectCardProps {
  project: Project;
}

const fixUrl = (url: string | undefined): string => {
  if (!url || url === 'undefined' || url === 'null' || url === '') return '';
  return url.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&');
};

export function ProjectCard({ project }: ProjectCardProps) {
  const imageUrl = getImageUrl(project.projectImage);
  const hasImage = imageUrl.length > 0;
  const allTechs = project.technologies || [];
  const status = project.projectStatus || 'planning';

  const { onMouseEnter, onMouseLeave } = useSmartPrefetch();
  const { navigateToProject } = useCachedNavigation();

  const handleClick = (e: React.MouseEvent) => {
    if (!project.slug) return;
    navigateToProject(project.slug, e);
  };

  return (
    <article
      className="group bg-white border border-grey-200 hover:border-grey-300 rounded-lg overflow-hidden h-full flex flex-col cursor-pointer transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
      onClick={handleClick}
      onMouseEnter={() => onMouseEnter(project.slug ?? '', project.title ?? '')}
      onMouseLeave={onMouseLeave}
      data-slug={project.slug}
      data-title={project.title}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick(e as any)}
    >
      {/* Image */}
      <div className="relative w-full bg-grey-100 overflow-hidden flex-shrink-0 h-[180px] sm:h-[200px]">
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20">
          <span className="bg-red text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full capitalize shadow-sm font-medium">
            {status.replace('-', ' ')}
          </span>
        </div>

        <div className="relative w-full h-full">
          {hasImage ? (
            <Image
              src={imageUrl}
              alt={project.title || 'Project'}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 400px"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-grey-100 to-grey-200 flex items-center justify-center">
              <span className="text-grey-400 text-xs sm:text-sm font-medium">No Image</span>
            </div>
          )}
        </div>

        {project.projectUrl && (
          <a
            href={fixUrl(project.projectUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} className="sm:w-4 sm:h-4 text-grey-700" />
          </a>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <div>
          <h3 className="font-semibold text-black group-hover:text-red transition-colors duration-200 text-sm sm:text-base">
            {project.title || 'Untitled'}
          </h3>
          <p className="text-xs sm:text-sm text-grey-600 leading-relaxed line-clamp-2 sm:line-clamp-3 mt-1 sm:mt-2">
            {project.excerpt || 'No description'}
          </p>
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2 sm:mt-4">
          {allTechs.slice(0, 3).map((tech, i) => (
            <span
              key={`${project._id}-tech-${i}`}
              className="text-[0.65rem] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-grey-100 rounded-full text-grey-700 font-medium whitespace-nowrap"
            >
              {tech.name}
            </span>
          ))}
          {allTechs.length > 3 && (
            <span className="text-[0.65rem] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red/10 text-red rounded-full font-semibold whitespace-nowrap">
              +{allTechs.length - 3}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
