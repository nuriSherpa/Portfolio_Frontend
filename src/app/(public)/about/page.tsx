// src/app/about/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import { getAbout } from '@/lib/api/actions/about';
import { AboutClient } from '@/components/about/about-client';
import { AboutSkeleton } from '@/components/about/about-skeleton';
import { notFound } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const { about } = await getAbout();

  if (!about) {
    return {
      title: 'About | Tendinuri Sherpa',
      description: 'Learn more about Tendinuri Sherpa',
    };
  }

  return {
    title: about.metaTitle,
    description: about.metaDescription,
    keywords: about.keywords,
    openGraph: {
      title: about.ogData.title,
      description: about.ogData.description,
      images: [{ url: about.ogData.image }],
      type: 'profile',
    },
  };
}

// Separate async component for data fetching
async function AboutContent() {
  const { about, error } = await getAbout();

  if (error || !about) {
    notFound();
  }

  return <AboutClient about={about} />;
}

export default function AboutPage() {
  return (
    <Suspense fallback={<AboutSkeleton />}>
      <AboutContent />
    </Suspense>
  );
}
