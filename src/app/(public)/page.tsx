// src/app/(public)/page.tsx
import { getHero } from '@/lib/api/actions/hero';
import { HeroSection } from '@/components/hero/hero-section';
import { PageError } from '@/components/shared/page-error';

export default async function HomePage() {
  const { hero, error } = await getHero();

  if (error || !hero) {
    return <PageError message={error || 'Failed to load'} />;
  }

  return <HeroSection hero={hero} />;
}
