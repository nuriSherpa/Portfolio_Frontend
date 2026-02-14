// src/components/hero/hero-section.tsx
'use client';

import { HeroSection as HeroType } from '@/lib/types/models';
import { LazyImage } from '@/components/shared/lazy-image';
import { Users, Box, ThumbsUp } from 'lucide-react';
import { FiGithub } from 'react-icons/fi';
import { FaLinkedinIn } from 'react-icons/fa';
import { BsTwitterX } from 'react-icons/bs';
import { Mail } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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
}

export function HeroSection({ hero }: HeroSectionProps) {
  const [likes, setLikes] = useState(876);
  const [isLiked, setIsLiked] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShouldAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const animatedVisitors = useAnimatedCounter(1248, 1000, shouldAnimate);
  const animatedProjects = useAnimatedCounter(42, 800, shouldAnimate);
  const animatedLikes = useAnimatedCounter(likes, 600, shouldAnimate);

  const handleLike = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikes((prev) => (newLiked ? prev + 1 : prev - 1));
  };

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20">
      <div className="flex flex-col items-center">
        {/* Profile Image */}
        {hero.profileImage && (
          <div className="mb-10 lg:mb-12 relative w-48 h-48 lg:w-56 lg:h-56">
            <div className="absolute inset-0 rounded-full border-3 border-red p-1 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <div className="w-full h-full rounded-full overflow-hidden">
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
            </div>
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
            className="flex items-center gap-3 group cursor-pointer select-none"
          >
            <ThumbsUp
              size={20}
              className={`transition-all ${isLiked ? 'fill-red text-red scale-110' : 'text-grey-600 group-hover:text-red'}`}
            />
            <div>
              <div
                className={`text-2xl font-bold tabular-nums ${isLiked ? 'text-red' : 'text-black'}`}
              >
                {formatNumber(animatedLikes)}
              </div>
              <div className="text-sm text-grey-500">Likes</div>
            </div>
          </button>
        </div>

        {/* Name & Title */}
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-black text-center mb-6">
          {hero.name}
        </h1>
        <p className="text-2xl lg:text-3xl font-medium text-red text-center mb-8 lg:mb-10">
          {hero.title}
        </p>

        {/* Bio */}
        <p className="max-w-2xl text-lg lg:text-xl text-grey-600 text-center mb-10 lg:mb-12">
          {hero.shortBio}
        </p>

        {/* Social Links */}
        {hero.socialLinks?.length > 0 && (
          <div className="flex justify-center gap-5 lg:gap-6">
            {hero.socialLinks
              .sort((a, b) => a.order - b.order)
              .map((link) => (
                <a
                  key={link._id}
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
  );
}
