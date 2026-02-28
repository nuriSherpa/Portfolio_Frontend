// components/hero/hero-skeleton.tsx
import { HeroSection } from '@/lib/types/models';

interface HeroSkeletonProps {
  hero: HeroSection;
}

export function HeroSkeleton({ hero }: HeroSkeletonProps) {
  return (
    <div className="container mx-auto px-4 py-12 lg:py-20">
      <div className="flex flex-col items-center animate-pulse">
        {/* Hire Me Button - Only if hero has hireMe enabled */}
        {hero.hireMe && (
          <div className="mb-6 h-7">
            <div className="bg-grey-200 rounded-full w-16 h-7"></div>
          </div>
        )}

        {/* Profile image - Dynamic margin based on hireMe */}
        <div
          className={`${hero.hireMe ? 'mb-6' : 'mb-10 lg:mb-12'} w-48 h-48 lg:w-56 lg:h-56 rounded-full bg-grey-200`}
        ></div>

        {/* Stats - Always 3 items */}
        <div className="mb-8 flex gap-8 lg:gap-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 bg-grey-200 rounded"></div>
              <div className="space-y-1">
                <div className="h-6 w-12 bg-grey-200 rounded"></div>
                <div className="h-3 w-10 bg-grey-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Name - Approximate width based on actual name length */}
        <div
          className="h-10 lg:h-14 bg-grey-200 rounded mb-4"
          style={{ width: `${Math.min(hero.name.length * 1.2, 18)}rem` }}
        ></div>

        {/* Title - Dynamic width for morphing text */}
        <div className="mb-4 w-full flex justify-center">
          <div
            className="h-7 lg:h-9 bg-grey-200 rounded"
            style={{ width: `${Math.max(...hero.titles.map((t) => t.length)) * 0.8}rem` }}
          ></div>
        </div>

        {/* Short Bio - Single line */}
        <div className="h-6 bg-grey-200 rounded w-full max-w-2xl mb-8"></div>

        {/* Social Links - Exact count from hero data */}
        {hero.socialLinks && hero.socialLinks.length > 0 && (
          <div className="flex justify-center gap-5 lg:gap-6">
            {hero.socialLinks.map((_, index) => (
              <div key={index} className="w-11 h-11 lg:w-13 lg:h-13 rounded-full bg-grey-200"></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
