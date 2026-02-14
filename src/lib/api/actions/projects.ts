// src/lib/api/actions/projects.ts
'use server';

import { serverFetch } from '../server-fetch';
import { ENDPOINTS } from '../endpoints';
import { Project } from '@/lib/types/models';

export async function getProjects() {
  try {
    const { data: projects, fromCache } = await serverFetch<Project[]>({
      url: ENDPOINTS.projects,
      cacheKey: 'projects',
      ttl: 5 * 60 * 1000,
    });

    console.log('[getProjects] Result:', { projectCount: projects?.length, fromCache });

    return {
      success: true,
      projects: projects || [],
      error: null,
      fromCache,
    };
  } catch (error: any) {
    console.error('[getProjects] Error:', error.message);
    return {
      success: false,
      projects: [],
      error: error.message,
      fromCache: false,
    };
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    const { data: project, fromCache } = await serverFetch<Project>({
      url: ENDPOINTS.projectBySlug(slug),
      cacheKey: `project:${slug}`,
      ttl: 10 * 60 * 1000,
    });

    return {
      success: true,
      project,
      error: null,
      fromCache,
    };
  } catch (error: any) {
    return {
      success: false,
      project: null,
      error: error.message,
      fromCache: false,
    };
  }
}
