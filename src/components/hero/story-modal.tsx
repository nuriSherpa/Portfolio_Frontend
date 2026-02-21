// src/components/hero/story-modal.tsx
'use client';

import { Story } from '@/lib/types/models';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StoryModalProps {
  stories: Story[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const fixUrl = (url: string) => url.replace(/&#x2F;/g, '/');

export function StoryModal({
  stories,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: StoryModalProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const currentStory = stories[currentIndex];
  const totalStories = stories.length;

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onNext();
    } else if (isRightSwipe) {
      onPrev();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  // Prevent body scroll when story is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Auto-advance story every 5 seconds (only if current image is loaded)
  useEffect(() => {
    if (!isOpen || !loadedImages.has(currentStory?.id)) return;

    const timer = setTimeout(() => {
      onNext();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isOpen, currentIndex, currentStory?.id, loadedImages, onNext]);

  // Preload next images
  useEffect(() => {
    if (!isOpen) return;

    // Preload next 2 images
    for (let i = 1; i <= 2; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < stories.length) {
        const nextStory = stories[nextIndex];
        if (!loadedImages.has(nextStory.id) && !imageErrors.has(nextStory.id)) {
          const img = new Image();
          img.src = fixUrl(nextStory.image);
          img.onload = () => {
            setLoadedImages((prev) => new Set(prev).add(nextStory.id));
          };
          img.onerror = () => {
            setImageErrors((prev) => new Set(prev).add(nextStory.id));
          };
        }
      }
    }
  }, [isOpen, currentIndex, stories, loadedImages, imageErrors]);

  const handleImageLoad = (storyId: string) => {
    setLoadedImages((prev) => new Set(prev).add(storyId));
  };

  const handleImageError = (storyId: string) => {
    console.error('Failed to load story image:', storyId);
    setImageErrors((prev) => new Set(prev).add(storyId));
  };

  if (!isOpen || !stories.length || !currentStory) return null;

  const isCurrentImageLoaded = loadedImages.has(currentStory.id);
  const hasCurrentImageError = imageErrors.has(currentStory.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        aria-label="Close stories"
      >
        <X size={24} />
      </button>

      {/* Navigation arrows */}
      {totalStories > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            disabled={currentIndex === 0}
            className={`absolute left-4 z-50 p-2 rounded-full transition-colors ${
              currentIndex === 0
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            aria-label="Previous story"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            aria-label="Next story"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Story counter badge */}
      {totalStories > 1 && (
        <div className="absolute top-4 left-4 z-50 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {currentIndex + 1} / {totalStories}
        </div>
      )}

      {/* Story content */}
      <div
        className="relative w-full max-w-md mx-4 bg-black rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bars */}
        {totalStories > 1 && (
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
            {stories.map((_, idx) => {
              const isLoaded = loadedImages.has(stories[idx].id);
              return (
                <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-white transition-all duration-500 ${
                      idx < currentIndex
                        ? 'w-full'
                        : idx === currentIndex && isLoaded
                          ? 'w-full animate-progress'
                          : 'w-0'
                    }`}
                    style={{
                      animationDuration: idx === currentIndex && isLoaded ? '5s' : '0s',
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Story image */}
        <div className="relative aspect-[9/16] w-full bg-black">
          {/* Image */}
          <img
            src={fixUrl(currentStory.image)}
            alt={currentStory.caption || 'Story image'}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isCurrentImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => handleImageLoad(currentStory.id)}
            onError={() => handleImageError(currentStory.id)}
          />

          {/* Loading indicator */}
          {!isCurrentImageLoaded && !hasCurrentImageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* Error state */}
          {hasCurrentImageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-grey-900">
              <div className="text-center text-white/60">
                <p className="text-sm mb-2">Failed to load image</p>
                <button
                  onClick={() => {
                    setImageErrors((prev) => {
                      const newSet = new Set(prev);
                      newSet.delete(currentStory.id);
                      return newSet;
                    });
                    setLoadedImages((prev) => {
                      const newSet = new Set(prev);
                      newSet.delete(currentStory.id);
                      return newSet;
                    });
                  }}
                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Caption overlay */}
          {currentStory.caption && isCurrentImageLoaded && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-20">
              <p className="text-white text-lg font-medium text-center">{currentStory.caption}</p>
              <p className="text-white/60 text-sm text-center mt-2">
                {new Date(currentStory.uploadedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>

        {/* Tap areas for navigation */}
        {totalStories > 1 && (
          <>
            <div
              className="absolute inset-y-0 left-0 w-1/3 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              aria-label="Previous story"
            />
            <div
              className="absolute inset-y-0 right-0 w-1/3 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              aria-label="Next story"
            />
          </>
        )}
      </div>
    </div>
  );
}
