// src/lib/api/actions/admin/projects.ts

import { adminCore } from '@/lib/api/admin-core';
import { ADMIN_ENDPOINTS } from '@/lib/api/admin-endpoints';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  order?: number;
}

export const projectApi = {
  getAll: () => adminCore.get<Project[]>(ADMIN_ENDPOINTS.projects.get),

  getById: (id: string) => adminCore.get<Project>(ADMIN_ENDPOINTS.projects.update(id)),

  create: (data: Omit<Project, 'id'>) =>
    adminCore.post<Project>(ADMIN_ENDPOINTS.projects.create, data),

  update: (id: string, data: Partial<Project>) =>
    adminCore.put<Project>(ADMIN_ENDPOINTS.projects.update(id), data),

  delete: (id: string) =>
    adminCore.delete<{ success: boolean }>(ADMIN_ENDPOINTS.projects.delete(id)),
};
