export const ENDPOINTS = {
  // Public routes (based on your backend routes)
  hero: '/hero',
  projects: '/projects',
  projectBySlug: (slug: string) => `/project/${slug}`,
  about: '/about',
  blogs: '/blog',
  blogBySlug: (slug: string) => `/blog/${slug}`,
  blogSearch: '/blog/search',
  autocomplete: '/blog/search/autocomplete',
  visitorInit: '/visitor/init', // NOT /public/visitor/init

  // Admin routes
  admin: {
    hero: '/hero',
    projects: '/project',
    about: '/about',
    blogs: '/blog',
  },
} as const;
