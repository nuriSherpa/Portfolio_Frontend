// src/lib/types/models.ts

export interface Story {
  id: string;
  image: string;
  caption?: string;
  uploadedAt: string;
}

export interface Stats {
  _id: string;
  totalLikes: number;
  totalVisitors: number;
  totalProjects: number;
  lastUpdated: Date | string;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSection {
  _id?: string;
  name: string;
  titles: string[];
  profileImage: string;
  shortBio: string;
  hireMe?: boolean;
  socialLinks: SocialLink[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  visitorCount?: number;
  projectCount?: number;
  likeCount?: number;
}

export interface Project {
  _id: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  slug: string;
  keywords?: string[];
  description: string;
  excerpt?: string;
  richContent?: string;
  projectImage: string;
  ogImage?: string;
  projectUrl: string;
  githubUrl?: string;
  demoUrl?: string;
  technologies: {
    name: string;
    category?: string;
    icon?: string;
  }[];
  isActive: boolean;
  isIndexed: boolean;
  projectStatus: 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'archived';
  projectCompletionDate?: Date;
  publishedAt: Date;
  views: number;
  likes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AboutMe {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  skills: string[];
  experiences: Experience[];
  socialLinks: SocialLink[];
  resumeUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
  order?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Blog types — aligned with the refactored backend
// Key change: `content` stores processed HTML directly.
//             `contentHtml` is removed (was redundant).
//             `featuredImage` is now optional (no longer required on create).
//             Inline images live inside `content` as <img> tags.
// ─────────────────────────────────────────────────────────────────────────────

export interface BlogAuthor {
  name: string;
  title?: string;
  avatar?: string;
  isGuest?: boolean;
}

export interface TocItem {
  level: number;
  text: string;
  id: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;

  // `content` is the canonical HTML field — replaces the old `contentHtml`.
  // It is processed HTML (heading ids injected, inline images embedded).
  content: string;

  // Featured / hero image — optional. Separate from inline content images.
  featuredImage?: string | null;
  featuredImageAlt?: string;

  // First <img> src found anywhere in `content` — used for OG / structured data
  // when featuredImage is absent.
  firstImage?: string | null;

  author?: BlogAuthor;

  // Dates
  publishedAt: string;
  lastUpdatedAt?: string;

  // Reading metadata
  readingTime?: number;
  wordCount?: number;
  views?: number;

  // Taxonomy
  tags: string[];
  category?: string;
  categorySlug?: string;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  focusKeyword?: string;

  // Table of contents — extracted from HTML headings by the backend
  toc?: TocItem[];

  // Mongoose timestamps
  createdAt?: string;
  updatedAt?: string;
}

// Shape returned by GET /api/blog (list endpoint)
export interface BlogListMeta {
  total: number;
  page: number;
  totalPages: number;
  showing: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BlogListFilters {
  categories: { name: string; slug: string; count: number }[];
  tags: { name: string; count: number }[];
  sortOptions: string[];
}

export interface BlogListResponse {
  posts: BlogPost[];
  meta: BlogListMeta;
  filters: BlogListFilters;
}

// Autocomplete result shapes
export type AutocompletePostResult = {
  type: 'post';
  id: string;
  title: string;
  slug: string;
  category?: string;
  tags: string[];
  display: string;
  source: 'title_match' | 'tag_match';
  priority: number;
  views: number;
  rank: number;
};

export type AutocompleteTagResult = {
  type: 'tag';
  tag: string;
  count: number;
  display: string;
  source: 'exact_tag';
  priority: number;
};

export type AutocompleteResult = AutocompletePostResult | AutocompleteTagResult;
