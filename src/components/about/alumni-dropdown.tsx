// src/components/about/alumni-dropdown.tsx
'use client';

import { useState } from 'react';
import { School, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { AlumniOf } from '@/lib/types/about';

interface AlumniDropdownProps {
  alumni: AlumniOf[];
}

export function AlumniDropdown({ alumni }: AlumniDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (alumni.length === 0) return null;

  // Single alumni - show inline without dropdown
  if (alumni.length === 1) {
    return (
      <div className="flex items-center gap-2 text-grey-600 text-xs sm:text-sm">
        <School size={14} className="text-grey-400" />
        <span>Alumni of</span>
        <a
          href={alumni[0].url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-grey-900 hover:text-red inline-flex items-center gap-1 transition-colors"
        >
          {alumni[0].name}
          <ExternalLink size={10} className="text-grey-400" />
        </a>
      </div>
    );
  }

  // Multiple alumni - show dropdown
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-grey-600 text-xs sm:text-sm hover:text-grey-900 transition-colors"
      >
        <School size={14} className="text-grey-400" />
        <span>Alumni of {alumni.length} institutions</span>
        {isOpen ? (
          <ChevronUp size={14} className="text-grey-400" />
        ) : (
          <ChevronDown size={14} className="text-grey-400" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-grey-200 rounded-lg shadow-lg z-10 py-2">
          {alumni.map((item) => (
            <a
              key={item._id || item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-2 text-sm text-grey-700 hover:bg-grey-50 hover:text-red transition-colors"
            >
              <span className="truncate">{item.name}</span>
              <ExternalLink size={12} className="text-grey-400 flex-shrink-0 ml-2" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
