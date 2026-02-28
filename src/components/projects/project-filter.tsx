// src/components/projects/project-filter.tsx
'use client';

interface ProjectFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'planning', label: 'Planning' },
];

export function ProjectFilter({ activeFilter, onFilterChange }: ProjectFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === f.value
              ? 'bg-red text-white'
              : 'bg-grey-100 text-grey-600 hover:bg-grey-200'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
