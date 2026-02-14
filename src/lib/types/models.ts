export interface HeroSection {
  _id: string;
  name: string;
  title: string;
  profileImage?: string;
  shortBio?: string;
  socialLinks: {
    platform: string;
    url: string;
    order: number;
    _id: string;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  thumbnail: string;
  images: string[];
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  publishedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
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
