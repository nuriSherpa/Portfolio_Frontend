// src/lib/api/admin-endpoints.ts
// Single source of truth for all admin API endpoint paths.
// These are appended to the prefix set in admin-core.ts (/api/admin or /api/proxy).

export const ADMIN_ENDPOINTS = {
  auth: {
    login: '/login',
    register: '/register',
    refresh: '/refresh',
    check: '/check',
    logout: '/logout',
  },

  hero: {
    get: '/hero',
    create: '/hero',
    update: (id: string) => `/hero/${id}`,
    stories: {
      get: '/hero/stories',
      create: '/hero/stories',
      update: (id: string) => `/hero/stories/${id}`,
      delete: (id: string) => `/hero/stories/${id}`,
    },
  },

  projects: {
    get: '/project',
    create: '/project',
    update: (id: string) => `/project/${id}`,
    delete: (id: string) => `/project/${id}`,
  },

  about: {
    get: '/about',
    create: '/about',
    update: (id: string) => `/about/${id}`,
    delete: (id: string) => `/about/${id}`,
  },

  blogs: {
    // List / create
    get: '/blog',
    create: '/blog',

    // Single post — use _id for admin operations, slug for public reads
    getOne: (slug: string) => `/blog/${slug}`,
    update: (id: string) => `/blog/${id}`,
    delete: (id: string) => `/blog/${id}`,

    // Inline image upload — called by rich text editor, returns { success, url }
    // Must sit before /:id routes in the router (already done in admin.routes.js)
    uploadImage: '/blog/upload-image',

    // Autocomplete search
    autocomplete: '/blog/search/autocomplete',
  },
} as const;
