// lib/types/project.ts
export interface Technology {
  name: string;
  category: string;
  icon?: string;
}

export interface Project {
  _id: string;
  title: string;
  metaDescription?: string;
  slug: string;
  keywords?: string[];
  description: string;
  excerpt: string;
  imageUrl: string;
  projectUrl?: string;
  technologies: Technology[];
  projectStatus: 'planning' | 'in-progress' | 'completed' | 'archived';
  projectCompletionDate?: string;
  metaTitle?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  structuredData?: Record<string, any>;
  canonicalUrl?: string;
  id: string;
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
  timestamp: string;
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
  timestamp: string;
}
