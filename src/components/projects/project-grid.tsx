// src/components/projects/project-grid.tsx
'use client';

import { useState } from 'react';
import { Project } from '@/lib/types';
import { ProjectCard } from './project-card';
import { ProjectFilter } from './project-filter';

interface ProjectsGridProps {
  projects: Project[];
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.projectStatus === filter);

  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-grey-500">No projects found.</p>
      </div>
    );
  }

  return (
    <div>
      <ProjectFilter activeFilter={filter} onFilterChange={setFilter} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {filtered.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </div>
  );
}
