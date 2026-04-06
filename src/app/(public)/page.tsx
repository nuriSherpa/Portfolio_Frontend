import { Suspense } from 'react';
import { HeroSection } from '@/components/hero/hero-section';
import { HeroSkeleton } from '@/components/hero/hero-skeleton';
import { getHero } from '@/lib/api/actions/hero';
import { getHeroStories } from '@/lib/api/actions/story';

export const revalidate = 0;

async function getStats() {
  const apiUrl = process.env.API_URL || 'http://localhost:9090/api/v1';
  try {
    const res = await fetch(`${apiUrl}/hero/stats`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const data = await res.json();
    console.log('[getStats] full response:', JSON.stringify(data, null, 2));
    return {
      visitors: data.data?.visitors ?? 0,
      projects: data.data?.projects ?? 0,
      likes: data.data?.likes ?? 0,
    };
  } catch (err) {
    console.error('[getStats] error:', err);
    return { visitors: 0, projects: 0, likes: 0 };
  }
}

export default async function HomePage() {
  const [heroResult, storiesResult, serverStats] = await Promise.all([
    getHero(),
    getHeroStories(),
    getStats(),
  ]);

  if (!heroResult.success || !heroResult.hero) {
    return <div>Failed to load hero data</div>;
  }

  console.log('[HomePage] serverStats being passed:', serverStats);

  return (
    <main>
      <div className="w-[80%] mx-auto">
        <Suspense fallback={<HeroSkeleton hero={heroResult.hero} />}>
          <HeroSection
            hero={heroResult.hero}
            stories={storiesResult.stories}
            serverStats={serverStats}
          />
        </Suspense>
      </div>
    </main>
  );
}
