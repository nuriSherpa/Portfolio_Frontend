// src/app/(public)/page.tsx
import { Suspense } from 'react';
import { HeroSection } from '@/components/hero/hero-section';
import { HeroSkeleton } from '@/components/hero/hero-skeleton'; // Import directly
import { getHero } from '@/lib/api/actions/hero';
import { getHeroStories } from '@/lib/api/actions/story';

export const revalidate = 3600;

export default async function HomePage() {
  const [heroResult, storiesResult] = await Promise.all([getHero(), getHeroStories()]);

  if (!heroResult.success || !heroResult.hero) {
    return <div>Failed to load hero data</div>;
  }

  const stats = {
    visitorCount: 1248,
    projectCount: 42,
    likeCount: 876,
  };

  return (
    <main>
      <div className="w-[80%] mx-auto">
        <Suspense fallback={<HeroSkeleton hero={heroResult.hero} />}>
          <HeroSection hero={heroResult.hero} stories={storiesResult.stories} stats={stats} />
        </Suspense>
      </div>
    </main>
  );
}
