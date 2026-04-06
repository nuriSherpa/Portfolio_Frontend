export const ENDPOINTS = {
  // Public routes
  visitorInit: '/visitor/init',
  hero: '/hero',
  heroStories: '/hero/stories',
  heroStats: '/hero/stats', // ← add
  heroLike: '/hero/stats/like', // ← add
  projects: '/projects',
  projectBySlug: (slug: string) => `/project/${slug}`,
  about: '/about',
  blogs: '/blog',
  blogBySlug: (slug: string) => `/blog/${slug}`,
  blogSearch: '/blog/search',
  autocomplete: '/blog/search/autocomplete',

  // Admin routes
  admin: {
    hero: '/hero',
    projects: '/project',
    about: '/about',
    blogs: '/blog',
  },
} as const;
