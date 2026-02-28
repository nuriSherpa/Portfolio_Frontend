// src/components/projects/project-card.tsx
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Project } from '@/lib/types/models';

interface ProjectCardProps {
  project: Project;
}

const fixUrl = (url: string | undefined): string => {
  if (!url || url === 'undefined' || url === 'null' || url === '') return '';
  return url.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&');
};

export function ProjectCard({ project }: ProjectCardProps) {
  const imageUrl = fixUrl(project.projectImage);
  const hasImage = imageUrl.length > 0;
  const techs = (project.technologies || []).slice(0, 3);
  const remaining = (project.technologies || []).length - 3;
  const status = project.projectStatus || 'planning';

  return (
    <article className="group bg-white border border-grey-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col min-h-[380px]">
      {/* Image */}
      <div className="relative w-full bg-grey-100 overflow-hidden flex-shrink-0 h-[200px]">
        <div className="absolute top-3 left-3 z-20">
          <span className="bg-red text-white text-xs px-2 py-1 rounded-full capitalize shadow-sm font-medium">
            {status.replace('-', ' ')}
          </span>
        </div>

        <Link href={`/projects/${project.slug || '#'}`} className="block w-full h-full">
          {hasImage ? (
            <img
              src={imageUrl}
              alt={project.title || 'Project'}
              className="w-full h-full object-cover block"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-grey-100 to-grey-200 flex items-center justify-center">
              <span className="text-grey-400 text-sm font-medium">No Image</span>
            </div>
          )}
        </Link>

        {project.projectUrl && (
          <a
            href={fixUrl(project.projectUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 shadow-md hover:scale-110"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={16} className="text-grey-700" />
          </a>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/projects/${project.slug || '#'}`} className="block mb-2">
          <h3 className="font-semibold text-black group-hover:text-red transition-colors duration-200 text-base line-clamp-1">
            {project.title || 'Untitled'}
          </h3>
        </Link>

        {/* Full excerpt - no truncation since you limit to 60-70 words */}
        <p className="text-sm text-grey-600 mb-3 flex-1 leading-relaxed">
          {project.excerpt || 'No description'}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {techs.map((tech, i) => (
            <span
              key={`${project._id}-tech-${i}`}
              className="text-xs px-2 py-1 bg-grey-100 rounded-full text-grey-700 font-medium"
            >
              {tech.name}
            </span>
          ))}
          {remaining > 0 && (
            <span className="text-xs px-2 py-1 bg-red/10 text-red rounded-full font-semibold">
              +{remaining}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
