// src/components/hero/story-modal.tsx
'use client';

import { Story } from '@/lib/types/models';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils/image-url';

interface StoryModalProps {
  stories: Story[];
  onClose: (viewedStoryIds: string[]) => void;
  viewedStories: Set<string>;
}

export function StoryModal({ stories, onClose, viewedStories }: StoryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedInSession, setViewedInSession] = useState<Set<string>>(new Set(viewedStories));
  const currentStory = stories[currentIndex];

  // Mark current story as viewed
  useEffect(() => {
    if (currentStory) {
      setViewedInSession((prev) => new Set(prev).add(currentStory.id));
    }
  }, [currentIndex, currentStory]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Close when reaching the end, pass all viewed stories
      onClose(Array.from(viewedInSession));
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleClose = () => {
    onClose(Array.from(viewedInSession));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, viewedInSession]);

  // Auto-advance
  useEffect(() => {
    const timer = setTimeout(handleNext, 5000);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (!stories.length) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={handleClose}
    >
      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
      >
        <X size={24} />
      </button>

      {/* Navigation arrows */}
      {stories.length > 1 && currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {stories.length > 1 && currentIndex < stories.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Story counter */}
      <div className="absolute top-4 left-4 z-50 text-white text-sm bg-black/50 px-3 py-1.5 rounded-full">
        {currentIndex + 1} / {stories.length}
      </div>

      {/* Story content */}
      <div
        className="relative w-full max-w-md mx-4 bg-black rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bars */}
        {stories.length > 1 && (
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
            {stories.map((_, idx) => {
              const isViewed = viewedInSession.has(stories[idx].id);
              return (
                <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      idx < currentIndex
                        ? 'w-full bg-white'
                        : idx === currentIndex
                          ? 'w-full bg-white animate-progress'
                          : isViewed
                            ? 'w-full bg-white/50'
                            : 'w-0'
                    }`}
                    style={{
                      animationDuration: idx === currentIndex ? '5s' : '0s',
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Story image */}
        <div className="relative aspect-[9/16] w-full">
          <Image
            src={getImageUrl(currentStory.image)}
            alt={currentStory.caption || 'Story'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 448px"
            priority
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Caption and timestamp */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {currentStory.caption && (
              <p className="text-white text-lg font-medium mb-2 text-center">
                {currentStory.caption}
              </p>
            )}
            <p className="text-white/70 text-sm text-center">
              {formatDate(currentStory.uploadedAt)}
            </p>
          </div>
        </div>

        {/* Click areas for navigation */}
        {stories.length > 1 && (
          <>
            <div
              className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            />
            <div
              className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
