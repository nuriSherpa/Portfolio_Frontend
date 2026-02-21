// src/components/hero/hero-section.tsx
'use client';

import { HeroSection as HeroType, Story } from '@/lib/types/models';
import { LazyImage } from '@/components/shared/lazy-image';
import { Users, Box, ThumbsUp, X } from 'lucide-react';
import { FiGithub } from 'react-icons/fi';
import { FaLinkedinIn } from 'react-icons/fa';
import { BsTwitterX } from 'react-icons/bs';
import { Mail } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { StoryModal } from './story-modal';

const platformIcons: Record<string, React.ReactNode> = {
  github: <FiGithub size={20} />,
  linkedin: <FaLinkedinIn size={20} />,
  twitter: <BsTwitterX size={20} />,
  email: <Mail size={20} />,
};

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function useAnimatedCounter(target: number, duration: number = 800, enabled: boolean = true) {
  const [displayValue, setDisplayValue] = useState(target);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startValueRef = useRef<number>(target);

  useEffect(() => {
    if (!enabled || target === startValueRef.current) {
      setDisplayValue(target);
      return;
    }

    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    startValueRef.current = displayValue;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - (startTimeRef.current || currentTime);
      const progress = Math.min(elapsed / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(
        startValueRef.current + (target - startValueRef.current) * easeOutCubic,
      );

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(target);
        startValueRef.current = target;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [target, duration, enabled]);

  return displayValue;
}

const fixUrl = (url: string) => url.replace(/&#x2F;/g, '/');

interface HeroSectionProps {
  hero: HeroType;
  initialStories?: Story[];
}

export function HeroSection({ hero, initialStories = [] }: HeroSectionProps) {
  const [likes, setLikes] = useState(876);
  const [isLiked, setIsLiked] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [likeBump, setLikeBump] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [stories] = useState<Story[]>(initialStories);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  const [showNoStoryToast, setShowNoStoryToast] = useState(false);

  const hasAnyStories = stories.length > 0;
  const allStoriesViewed = hasAnyStories && stories.every((story) => viewedStories.has(story.id));
  const showRedOutline = !hasAnyStories || allStoriesViewed;

  useEffect(() => {
    const timer = setTimeout(() => setShouldAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Mark story as viewed when shown
  useEffect(() => {
    if (showStory && stories[currentStoryIndex]) {
      setViewedStories((prev) => new Set(prev).add(stories[currentStoryIndex].id));
    }
  }, [showStory, currentStoryIndex, stories]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showNoStoryToast) {
      const timer = setTimeout(() => setShowNoStoryToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showNoStoryToast]);

  const animatedVisitors = useAnimatedCounter(1248, 1000, shouldAnimate);
  const animatedProjects = useAnimatedCounter(42, 800, shouldAnimate);
  const animatedLikes = useAnimatedCounter(likes, 600, shouldAnimate);

  const handleLike = () => {
    setLikeBump(true);
    setTimeout(() => setLikeBump(false), 300);

    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikes((prev) => (newLiked ? prev + 1 : prev - 1));
  };

  const handleProfileClick = () => {
    if (hasAnyStories) {
      console.log('Opening stories:', stories);
      setShowStory(true);
      setCurrentStoryIndex(0);
    } else {
      // Show "No stories available" toast
      setShowNoStoryToast(true);
    }
  };

  const handleCloseStory = () => {
    setShowStory(false);
  };

  const handleNextStory = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else {
      setShowStory(false);
    }
  }, [currentStoryIndex, stories.length]);

  const handlePrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    }
  }, [currentStoryIndex]);

  return (
    <>
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="flex flex-col items-center">
          {/* Profile Image with Story Logic */}
          {hero.profileImage && (
            <div className="mb-10 lg:mb-12 relative flex flex-col items-center">
              {/* Hire Me Button */}
              {hero.hireMe === true && (
                <div className="mb-4 z-10">
                  <Link href="/resume">
                    <div className="bg-red text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-sm whitespace-nowrap cursor-pointer hover:bg-red/90 transition-colors">
                      Hire Me
                    </div>
                  </Link>
                </div>
              )}

              {/* Profile Image with Instagram-style outline */}
              <div
                className="relative w-48 h-48 lg:w-56 lg:h-56 cursor-pointer transition-transform hover:scale-105"
                onClick={handleProfileClick}
              >
                {showRedOutline ? (
                  // Red outline: No stories OR all stories viewed
                  <>
                    <div className="absolute -inset-2 rounded-full bg-red" />
                    <div className="absolute -inset-1 rounded-full bg-white" />
                    <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg z-10">
                      <LazyImage
                        src={fixUrl(hero.profileImage)}
                        alt={hero.name}
                        fill
                        className="object-cover"
                        containerClassName="w-full h-full"
                        placeholder="/placeholder-hero.jpg"
                        priority
                      />
                    </div>
                  </>
                ) : (
                  // Gradient outline: Has unviewed stories
                  <>
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-red via-orange-500 to-red" />
                    <div className="absolute -inset-1 rounded-full bg-white" />
                    <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg z-10">
                      <LazyImage
                        src={fixUrl(hero.profileImage)}
                        alt={hero.name}
                        fill
                        className="object-cover"
                        containerClassName="w-full h-full"
                        placeholder="/placeholder-hero.jpg"
                        priority
                      />
                    </div>
                  </>
                )}
              </div>

              {/* No Story Toast Notification */}
              {showNoStoryToast && (
                <div className="absolute top-full mt-4 z-50 animate-fade-in-up">
                  <div className="bg-black/90 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 min-w-[200px]">
                    <div className="w-2 h-2 rounded-full bg-red" />
                    <span className="text-sm font-medium">No stories available</span>
                    <button
                      onClick={() => setShowNoStoryToast(false)}
                      className="ml-auto text-white/60 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="mb-10 flex justify-center gap-8 lg:gap-12">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-grey-600" />
              <div>
                <div className="text-2xl font-bold text-black tabular-nums">
                  {formatNumber(animatedVisitors)}
                </div>
                <div className="text-sm text-grey-500">Visitors</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Box size={20} className="text-grey-600" />
              <div>
                <div className="text-2xl font-bold text-black tabular-nums">
                  {formatNumber(animatedProjects)}
                </div>
                <div className="text-sm text-grey-500">Projects</div>
              </div>
            </div>

            <button
              onClick={handleLike}
              className={`flex items-center gap-3 group cursor-pointer select-none transition-transform duration-200 ${
                likeBump ? 'scale-110' : ''
              }`}
            >
              <ThumbsUp
                size={20}
                className={`transition-all duration-200 ${
                  isLiked ? 'text-red' : 'text-grey-600 group-hover:text-red'
                }`}
              />
              <div>
                <div
                  className={`text-2xl font-bold tabular-nums transition-colors duration-200 ${
                    isLiked ? 'text-red' : 'text-black'
                  }`}
                >
                  {formatNumber(animatedLikes)}
                </div>
                <div className="text-sm text-grey-500">Likes</div>
              </div>
            </button>
          </div>

          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-black text-center mb-6">
            {hero.name}
          </h1>
          <p className="text-2xl lg:text-3xl font-medium text-red text-center mb-8 lg:mb-10">
            {hero.title}
          </p>

          <p className="max-w-2xl text-lg lg:text-xl text-grey-600 text-center mb-10 lg:mb-12">
            {hero.shortBio}
          </p>

          {hero.socialLinks?.length > 0 && (
            <div className="flex justify-center gap-5 lg:gap-6">
              {hero.socialLinks
                .sort((a, b) => a.order - b.order)
                .map((link, index) => (
                  <a
                    key={link._id || `social-link-${index}-${link.platform}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 lg:p-4 border border-grey-200 text-grey-600 hover:border-red hover:text-red transition-all rounded-full hover:scale-110"
                  >
                    {platformIcons[link.platform] || link.platform}
                  </a>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Story Modal */}
      {hasAnyStories && (
        <StoryModal
          stories={stories}
          currentIndex={currentStoryIndex}
          isOpen={showStory}
          onClose={handleCloseStory}
          onNext={handleNextStory}
          onPrev={handlePrevStory}
        />
      )}
    </>
  );
}
