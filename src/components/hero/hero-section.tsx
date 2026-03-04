// src/components/hero/hero-section.tsx
'use client';

import { HeroSection as HeroType, Story } from '@/lib/types/models';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils/image-url';
import { StoryModal } from './story-modal';
import { NoStoriesModal } from './no-stories-modal';
import { HeroStats } from './hero-stats';
import { FiGithub } from 'react-icons/fi';
import { FaLinkedinIn } from 'react-icons/fa';
import { BsTwitterX } from 'react-icons/bs';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { MorphingText } from '@/components/ui/morphing-text';

const platformIcons: Record<string, React.ReactNode> = {
  github: <FiGithub size={20} />,
  linkedin: <FaLinkedinIn size={20} />,
  twitter: <BsTwitterX size={20} />,
  email: <Mail size={20} />,
};

interface HeroSectionProps {
  hero: HeroType;
  stories: Story[];
  stats: {
    visitorCount: number;
    projectCount: number;
    likeCount: number;
  };
}

export function HeroSection({ hero, stories, stats }: HeroSectionProps) {
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showNoStoriesModal, setShowNoStoriesModal] = useState(false);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());

  // Load viewed stories from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('viewedStories');
    if (saved) {
      setViewedStories(new Set(JSON.parse(saved)));
    }
  }, []);

  const handleProfileClick = () => {
    if (stories.length > 0) {
      setShowStoryModal(true);
    } else {
      setShowNoStoriesModal(true);
    }
  };

  const handleStoryClose = (viewedStoryIds: string[]) => {
    // Update viewed stories
    const newViewed = new Set(viewedStories);
    viewedStoryIds.forEach((id) => newViewed.add(id));
    setViewedStories(newViewed);
    localStorage.setItem('viewedStories', JSON.stringify(Array.from(newViewed)));
    setShowStoryModal(false);
  };

  const handleNoStoriesClose = () => {
    setShowNoStoriesModal(false);
  };

  // Check if all stories are viewed
  const allStoriesViewed =
    stories.length > 0 && stories.every((story) => viewedStories.has(story.id));

  // Outline logic:
  // - Gradient: if there are stories AND not all are viewed
  // - Red: if no stories OR all stories are viewed
  const outlineClass =
    stories.length > 0 && !allStoriesViewed
      ? 'bg-gradient-to-tr from-red via-orange-500 to-red'
      : 'bg-red';

  // Cursor style - always pointer now (both cases show a modal)
  const cursorClass = 'cursor-pointer';

  return (
    <div className="w-full flex justify-center">
      <div className="w-[90%] sm:w-[85%] md:w-[80%] lg:w-[80%] max-w-6xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="flex flex-col items-center">
          {/* Hire Me Button */}
          {hero.hireMe && (
            <div className="mb-6">
              <Link href="/resume">
                <div className="bg-red text-white px-4 py-1.5 rounded-full text-xs font-medium hover:font-bold">
                  Hire Me
                </div>
              </Link>
            </div>
          )}

          {/* Profile Image - Click always shows modal (stories or no stories) */}
          <div
            className={`relative w-48 h-48 lg:w-56 lg:h-56 transition-transform hover:scale-105 mb-6 ${cursorClass}`}
            onClick={handleProfileClick}
          >
            <div className={`absolute -inset-2 rounded-full ${outlineClass}`} />
            <div className="absolute -inset-1 rounded-full bg-white" />
            <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg z-10">
              <Image
                src={getImageUrl(hero.profileImage)}
                alt={hero.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 192px, 224px"
              />
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-8">
            <HeroStats
              visitorCount={stats.visitorCount}
              projectCount={stats.projectCount}
              likeCount={stats.likeCount}
            />
          </div>

          {/* Name */}
          <h1 className="text-4xl lg:text-5xl font-bold text-black text-center mb-2">
            {hero.name}
          </h1>

          {/* Morphing Title - Centered */}
          <div className="mb-4 w-full flex justify-center">
            <MorphingText
              texts={hero.titles}
              className="text-2xl lg:text-3xl font-medium text-red text-center inline-block"
              interval={5500}
            />
          </div>

          {/* Short Bio */}
          <p className="max-w-2xl text-base sm:text-lg text-grey-600 text-center px-2 sm:px-4 mb-8">
            {hero.shortBio}
          </p>

          {/* Social Links */}
          {hero.socialLinks?.length > 0 && (
            <div className="flex justify-center gap-4 sm:gap-5 lg:gap-6 mb-8">
              {hero.socialLinks
                .sort((a, b) => {
                  if (a.order !== undefined && b.order !== undefined) {
                    return a.order - b.order;
                  }
                  if (a.order !== undefined) return -1;
                  if (b.order !== undefined) return 1;
                  return 0;
                })
                .map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 sm:p-3 border border-grey-200 text-grey-600 hover:border-red hover:text-red transition-all rounded-full hover:scale-110"
                  >
                    {platformIcons[link.platform] || link.platform}
                  </a>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Story Modal - When stories exist */}
      {showStoryModal && stories.length > 0 && (
        <StoryModal stories={stories} onClose={handleStoryClose} viewedStories={viewedStories} />
      )}

      {/* No Stories Modal - When no stories exist */}
      {showNoStoriesModal && stories.length === 0 && (
        <NoStoriesModal onClose={handleNoStoriesClose} />
      )}
    </div>
  );
}
