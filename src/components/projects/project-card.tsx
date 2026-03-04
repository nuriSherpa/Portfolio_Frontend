// src/components/projects/project-card.tsx
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Project } from '@/lib/types/models';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils/image-url';

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

  return (
    <article className="group bg-white border border-grey-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      {/* Image - fixed height */}
      <div className="relative w-full bg-grey-100 overflow-hidden flex-shrink-0 h-[180px] sm:h-[200px]">
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20">
          <span className="bg-red text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full capitalize shadow-sm font-medium">
            {status.replace('-', ' ')}
          </span>
        </div>

        <Link href={`/projects/${project.slug || '#'}`} className="block w-full h-full">
          <div className="relative w-full h-full">
            {hasImage ? (
              <Image
                src={imageUrl}
                alt={project.title || 'Project'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                loading="eager"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-grey-100 to-grey-200 flex items-center justify-center">
                <span className="text-grey-400 text-xs sm:text-sm font-medium">No Image</span>
              </div>
            )}
          </div>
        </Link>

        {project.projectUrl && (
          <a
            href={fixUrl(project.projectUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 shadow-md hover:scale-110"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} className="sm:w-4 sm:h-4 text-grey-700" />
          </a>
        )}
      </div>

      {/* Content - adjusted padding for phone */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <Link href={`/projects/${project.slug || '#'}`} className="block">
          <h3 className="font-semibold text-black group-hover:text-red transition-colors duration-200 text-sm sm:text-base">
            {project.title || 'Untitled'}
          </h3>
          <p className="text-xs sm:text-sm text-grey-600 leading-relaxed line-clamp-2 sm:line-clamp-3 mt-1 sm:mt-2">
            {project.excerpt || 'No description'}
          </p>
        </Link>

        {/* Tech tags - reduced top margin on phone */}
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2 sm:mt-4">
          {/* Show first 3 tags always */}
          {allTechs.slice(0, 3).map((tech, i) => (
            <span
              key={`${project._id}-tech-${i}`}
              className="text-[0.65rem] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-grey-100 rounded-full text-grey-700 font-medium whitespace-nowrap"
            >
              {tech.name}
            </span>
          ))}

          {/* If there are more than 3 tags, show +X */}
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
