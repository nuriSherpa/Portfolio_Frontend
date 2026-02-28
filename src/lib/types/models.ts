// src/lib/types/models.ts
export interface Story {
  id: string;
  image: string;
  caption?: string;
  uploadedAt: string;
}

// Main Stats interface
export interface Stats {
  _id: string;
  totalLikes: number; // Defaults to 0, min: 0
  totalVisitors: number; // Defaults to 0, min: 0
  totalProjects: number; // Total number of projects
  lastUpdated: Date | string; // Defaults to Date.now
  createdAt: string; // From timestamps: true
  updatedAt: string; // From timestamps: true
}
// src/lib/types/models.ts
// src/lib/types/models.ts
export interface HeroSection {
  _id?: string; // Made optional
  name: string;
  titles: string[];
  profileImage: string;
  shortBio: string;
  hireMe?: boolean;
  socialLinks: SocialLink[];
  isActive?: boolean; // Made optional
  createdAt?: string; // Made optional
  updatedAt?: string; // Made optional
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

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  readTime: number;
  publishedAt: string;
  updatedAt?: string;
  author?: Author;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
}

export interface Author {
  name: string;
  avatar?: string;
  bio?: string;
}

export interface SearchResult {
  posts: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
}
