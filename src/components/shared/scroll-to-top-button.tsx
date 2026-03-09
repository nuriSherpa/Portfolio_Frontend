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
        {/* Arrow only - no box, larger size to match text height */}
        <ArrowUpIcon ref={iconRef} size={44} className="text-red" />

        {/* Text - red background, white text */}
        <span className="flex items-center h-11 px-4 bg-red text-white rounded-lg font-medium">
          Go to Top
        </span>
      </button>
    </div>
  );
}
