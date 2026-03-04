// src/components/hero/no-stories-modal.tsx
'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface NoStoriesModalProps {
  onClose: () => void;
}

export function NoStoriesModal({ onClose }: NoStoriesModalProps) {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
      >
        <X size={24} />
      </button>

      {/* Modal content - same dimensions as story modal */}
      <div
        className="relative w-full max-w-md mx-4 bg-black rounded-2xl overflow-hidden aspect-[9/16]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-grey-900 to-black" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
          {/* Icon */}

          {/* Text */}
          <h3 className="text-2xl font-semibold text-white mb-3">No Stories Yet</h3>
          <p className="text-base text-white/60 max-w-xs">
            Check back later for updates and stories
          </p>

          {/* Tap to close hint */}
          <p className="absolute bottom-8 left-0 right-0 text-xs text-white/40">
            Tap anywhere to close
          </p>
        </div>

        {/* Click area for closing (whole modal already has onClick) */}
      </div>
    </div>
  );
}
