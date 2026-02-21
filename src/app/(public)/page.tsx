// src/app/(public)/page.tsx
import { Suspense } from 'react';
import { HeroSection } from '@/components/hero/hero-section';
import { getHero } from '@/lib/api/actions/hero';
import { getHeroStories } from '@/lib/api/actions/story';
import { PageSkeleton } from '@/components/shared/page-skeleton';

export default async function HomePage() {
  const [heroResult, storiesResult] = await Promise.all([getHero(), getHeroStories()]);

  if (!heroResult.success || !heroResult.hero) {
    return <div>Failed to load hero data</div>;
  }

  return (
    <main>
      <Suspense fallback={<PageSkeleton type="hero" />}>
        <HeroSection
          hero={heroResult.hero}
          initialStories={storiesResult.success ? storiesResult.stories : []}
        />
      </Suspense>
    </main>
  );
}
