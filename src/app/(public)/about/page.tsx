// src/app/about/page.tsx - IMPROVED VERSION
import { Metadata } from 'next';
import { Suspense } from 'react';
import { getAbout } from '@/lib/api/actions/about';
import { AboutClient } from '@/components/about/about-client';
import { AboutSkeleton } from '@/components/about/about-skeleton';
import { notFound } from 'next/navigation';

// Force static generation with ISR
export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hour

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

// Server Component - data is fetched and cached at build time
async function AboutContent() {
  const { about, error } = await getAbout();

  if (error || !about) {
    notFound();
  }

  // Pass pre-rendered data to client component
  return <AboutClient about={about} />;
}

export default function AboutPage() {
  return (
    <div className="w-[80%] mx-auto">
      <Suspense fallback={<AboutSkeleton />}>
        <AboutContent />
      </Suspense>
    </div>
  );
}
