// src/components/projects/project-card.tsx
import { Project } from '@/lib/types/project';
import Link from 'next/link';
import { Calendar, ExternalLink } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

const statusColors: Record<string, string> = {
  planning: 'bg-amber-100 text-amber-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  archived: 'bg-grey-100 text-grey-600',
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="group bg-white rounded-xl border border-grey-200 overflow-hidden hover:shadow-lg transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[project.projectStatus]}`}
          >
            {project.projectStatus}
          </span>
          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-grey-400 hover:text-red"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        <h3 className="text-xl font-bold text-black mb-2 group-hover:text-red transition-colors">
          <Link href={`/projects/${project.slug}`}>{project.title}</Link>
        </h3>

        <p className="text-grey-600 text-sm mb-4 line-clamp-2">{project.excerpt}</p>

        {project.technologies?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.slice(0, 3).map((tech) => (
              <span key={tech.name} className="px-2 py-1 bg-grey-50 text-grey-600 text-xs rounded">
                {tech.name}
              </span>
            ))}
          </div>
        )}

        {project.projectCompletionDate && (
          <div className="flex items-center gap-2 text-grey-500 text-sm">
            <Calendar size={14} />
            {new Date(project.projectCompletionDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
