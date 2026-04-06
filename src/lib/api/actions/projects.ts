// src/lib/api/actions/projects.ts
'use server'; // ← ADD THIS
import { cachedFetch, invalidateCache } from '../cached-fetch';
import { Project } from '@/lib/types/models';
import { ENDPOINTS } from '../endpoints';

interface ProjectsApiResponse {
  success: boolean;
  message?: string;
  data: {
    projects: Project[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      nextPage: number | null;
      prevPage: number | null;
    };
  };
  timestamp?: string;
}

interface ProjectApiResponse {
  success: boolean;
  message?: string;
  data: Project;
  timestamp?: string;
}

const PROJECTS_CACHE_KEY = 'projects:list';
const PROJECTS_CACHE_TTL = 300; // 5 minutes - changes more often
const PROJECT_DETAIL_CACHE_TTL = 3600; // 1 hour - rarely changes

// src/lib/api/actions/projects.ts
// src/lib/api/actions/projects.ts

export async function getProjects(limit = 6, page = 1) {
  try {
    const url = `${ENDPOINTS.projects}?limit=${limit}&page=${page}`;
    console.log('[getProjects] Fetching URL:', url);
    console.log('[getProjects] Environment:', {
      isBrowser: typeof window !== 'undefined',
      hasApiUrl: !!process.env.API_URL,
    });

    const result = await cachedFetch<ProjectsApiResponse['data']>({
      url: url,
      key: `projects:list:page:${page}:limit:${limit}`,
      strategy: 'memory',
      ttl: PROJECTS_CACHE_TTL,
      parser: (res: ProjectsApiResponse) => {
        if (!res?.success) {
          throw new Error(res?.message || 'API returned unsuccessful response');
        }
        if (!res?.data) {
          throw new Error('No projects data received');
        }
        return res.data;
      },
    });

    return {
      projects: result.projects || [],
      pagination: result.pagination || {
        hasNextPage: false,
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      },
    };
  } catch (error: any) {
    console.error('[getProjects] Error:', error.message);
    console.error('[getProjects] Full error:', error);
    return {
      projects: [] as Project[],
      pagination: {
        hasNextPage: false,
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      },
    };
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    const project = await cachedFetch<Project>({
      url: ENDPOINTS.projectBySlug(slug),
      key: `projects:slug:${slug}`,
      strategy: 'memory',
      ttl: PROJECT_DETAIL_CACHE_TTL,
      parser: (result: ProjectApiResponse) => {
        if (!result?.success) {
          throw new Error(result?.message || 'API returned unsuccessful response');
        }
        if (!result?.data) {
          throw new Error('No project data received');
        }
        return result.data;
      },
    });

    return project;
  } catch (error: any) {
    console.error('[getProjectBySlug] Error:', error.message);
    return null;
  }
}

// Force fresh fetch for projects (no cache)
export async function getProjectsFresh(limit = 6, page = 1) {
  try {
    const result = await cachedFetch<ProjectsApiResponse['data']>({
      url: `${ENDPOINTS.projects}?limit=${limit}&page=${page}`,
      key: `${PROJECTS_CACHE_KEY}:fresh:page:${page}`,
      strategy: 'no-cache',
      parser: (result) => {
        if (!result?.success) throw new Error('API returned unsuccessful');
        return result.data;
      },
    });

    return {
      projects: result.projects || [],
      pagination: result.pagination || {
        hasNextPage: false,
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      },
    };
  } catch (error: any) {
    console.error('[getProjectsFresh] Error:', error.message);
    return {
      projects: [] as Project[],
      pagination: {
        hasNextPage: false,
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      },
    };
  }
}

// Improved invalidation functions
// src/lib/api/actions/projects.ts

export async function invalidateProjectsCache(page?: number) {
  if (page) {
    invalidateCache(`projects:list:page:${page}`);
  } else {
    invalidateCache('projects:list');
  }
}

export async function invalidateProjectCache(slug: string) {
  invalidateCache(`projects:slug:${slug}`);
}
