// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { getProjects } from '@/lib/api/actions/projects';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

// Define the type explicitly
type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: 'weekly' | 'monthly' | 'always' | 'hourly' | 'daily' | 'yearly' | 'never';
  priority: number;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes with explicit typing
  const routes: SitemapEntry[] = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Dynamic project pages
  const { projects } = await getProjects(100, 1);
  const projectRoutes: SitemapEntry[] = projects.map((project) => ({
    url: `${SITE_URL}/projects/${project.slug}`,
    lastModified: new Date(project.createdAt || Date.now()),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...routes, ...projectRoutes];
}
