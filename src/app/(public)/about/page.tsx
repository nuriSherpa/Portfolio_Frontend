// src/app/about/page.tsx - COMPLETE SSR VERSION
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAbout } from '@/lib/api/actions/about';
import { AboutView } from '@/components/about/about-view'; // No 'use client'!
import { Suspense } from 'react';
import { AboutSkeleton } from '@/components/about/about-skeleton';

export const dynamic = 'force-static';
export const revalidate = 3600;

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


export default async function AboutPage() {
  const { about, error } = await getAbout();

  if (error || !about) {
    notFound();
  }

  // Server-rendered HTML sent to browser - no hydration needed
  return (
    <div className="w-[80%] mx-auto">
      <Suspense fallback={<AboutSkeleton />}>
        <AboutView about={about} />
      </Suspense>
    </div>
  );
}
