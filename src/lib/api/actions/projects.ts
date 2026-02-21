// src/lib/api/actions/projects.ts
'use server';

import { safeFetch } from '../fetcher';
import { ENDPOINTS } from '../endpoints';
import { Project } from '@/lib/types/models';

interface GetProjectsOptions {
  page?: number;
  limit?: number;
}

export async function getProjects({ page = 1, limit = 6 }: GetProjectsOptions = {}) {
  try {
    const url = `${ENDPOINTS.projects}?page=${page}&limit=${limit}`;

    const response = await safeFetch<{
      success: boolean;
      data: {
        projects: Project[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
          hasNextPage: boolean;
        };
      };
    }>({
      url,
      method: 'GET',
      isServer: true,
      skipCache: false,
    });

    return {
      success: true,
      projects: response?.data?.data?.projects || [],
      pagination: response?.data?.data?.pagination || null,
      error: null,
    };
  } catch (error: any) {
    console.error('[getProjects] Error:', error.message);
    return {
      success: false,
      projects: [],
      pagination: null,
      error: error.message,
    };
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    const response = await safeFetch<{ success: boolean; data: Project }>({
      url: ENDPOINTS.projectBySlug(slug),
      method: 'GET',
      isServer: true,
    });

    return {
      success: true,
      project: response?.data?.data || null,
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      project: null,
      error: error.message,
    };
  }
}
