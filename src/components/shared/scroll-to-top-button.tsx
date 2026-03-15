// src/components/about/scroll-to-top-button.tsx
'use client';

import { useRef } from 'react';
import { ArrowUpIcon, ArrowUpIconHandle } from '@/components/icons/square-arrow-up-icon';

export function ScrollToTopButton() {
  const iconRef = useRef<ArrowUpIconHandle>(null);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="flex justify-center py-12">
      <button
        onClick={scrollToTop}
        onMouseEnter={() => iconRef.current?.startAnimation()}
        onMouseLeave={() => iconRef.current?.stopAnimation()}
        className="group inline-flex items-center gap-2"
      >
        {/* Text - transparent background, black outline, black text */}
        <span className="flex items-center gap-2 h-11 px-4 bg-transparent text-grey-600 rounded-lg font-medium text-base border-2 border-grey-600">
          <ArrowUpIcon ref={iconRef} size={18} className="text-grey-600" />
          Go to Top
        </span>
      </button>
    </div>
  );
}
