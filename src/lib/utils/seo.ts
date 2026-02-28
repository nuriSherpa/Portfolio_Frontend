import { Metadata } from 'next';

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
  keywords?: string[];
}

export function generateSeo({
  title,
  description,
  path,
  image = '/og-image.jpg',
  type = 'website',
  publishedAt,
  updatedAt,
  author,
  keywords,
}: SeoProps): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const url = `${siteUrl}${path}`;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return {
    title,
    description,
    keywords,
    authors: author ? [{ name: author }] : undefined,
    metadataBase: new URL(siteUrl), // Added: Helps Next.js resolve relative URLs
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: 'Portfolio',
      locale: 'en_US', // Added: Good for international SEO
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: publishedAt,
      modifiedTime: updatedAt,
      authors: author ? [author] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImage],
    },
    robots: {
      // Added: Explicit crawler permissions
      index: true,
      follow: true,
    },
  };
}
