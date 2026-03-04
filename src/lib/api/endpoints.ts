// src/lib/api/endpoints.ts
export const ENDPOINTS = {
  // Public routes
  hero: '/hero',
  heroStories: '/hero/stories',
  projects: '/projects',
  projectBySlug: (slug: string) => `/project/${slug}`,
  about: '/about',
  blogs: '/blog',
  blogBySlug: (slug: string) => `/blog/${slug}`,
  blogSearch: '/blog/search',
  autocomplete: '/blog/search/autocomplete',
  visitorInit: '/visitor/init',

  // Admin routes
  admin: {
    hero: '/hero',
    projects: '/project',
    about: '/about',
    blogs: '/blog',
  },
} as const;
