// src/lib/api/actions/admin/about.ts

import { adminCore } from '@/lib/api/admin-core';
import { ADMIN_ENDPOINTS } from '@/lib/api/admin-endpoints';

interface About {
  id: string;
  title: string;
  bio: string;
  imageUrl?: string;
  skills?: string[];
  resumeUrl?: string;
}

export const aboutApi = {
  get: () => adminCore.get<About>(ADMIN_ENDPOINTS.about.get),

  create: (data: Omit<About, 'id'>) => adminCore.post<About>(ADMIN_ENDPOINTS.about.create, data),

  update: (id: string, data: Partial<About>) =>
    adminCore.put<About>(ADMIN_ENDPOINTS.about.update(id), data),

  delete: (id: string) => adminCore.delete<{ success: boolean }>(ADMIN_ENDPOINTS.about.delete(id)),
};
