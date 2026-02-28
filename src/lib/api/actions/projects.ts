// src/lib/api/actions/projects.ts
import { serverFetch } from '../server-fetch';
import { Project } from '@/lib/types/models';
import { ENDPOINTS } from '../endpoints';

interface ProjectsApiResponse {
  success: boolean;
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

export async function getProjects(limit = 6, page = 1) {
  const result = await serverFetch<ProjectsApiResponse>({
    url: `${ENDPOINTS.projects}?limit=${limit}&page=${page}`,
  });

  if (result.error || !result.data) {
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

  const apiResponse = result.data;

  return {
    projects: apiResponse.data?.projects ?? [],
    pagination: apiResponse.data?.pagination ?? {
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

export async function getProjectBySlug(slug: string) {
  interface ProjectApiResponse {
    success: boolean;
    data: Project;
    timestamp?: string;
  }

  const result = await serverFetch<ProjectApiResponse>({
    url: ENDPOINTS.projectBySlug(slug),
  });

  if (result.error || !result.data) {
    return null;
  }

  return result.data.data ?? null;
}
