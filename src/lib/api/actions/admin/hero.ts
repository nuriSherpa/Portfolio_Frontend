// src/lib/api/actions/admin/hero.ts

import { adminCore } from '@/lib/api/admin-core';
import { ADMIN_ENDPOINTS } from '@/lib/api/admin-endpoints';

interface Hero {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  order?: number;
}

interface HeroStory {
  id: string;
  heroId: string;
  title: string;
  content: string;
}

// ─── Hero CRUD uses useProxy: true (calls /api/proxy/*) ─────────────────────

export const heroApi = {
  // Get all heroes
  getAll: () => adminCore.get<Hero[]>(ADMIN_ENDPOINTS.hero.get),

  // Get single hero
  getById: (id: string) => adminCore.get<Hero>(ADMIN_ENDPOINTS.hero.update(id)),

  // Create hero
  create: (data: Omit<Hero, 'id'>) => adminCore.post<Hero>(ADMIN_ENDPOINTS.hero.create, data),

  // Update hero
  update: (id: string, data: Partial<Hero>) =>
    adminCore.put<Hero>(ADMIN_ENDPOINTS.hero.update(id), data),

  // Delete hero
};

// ─── Hero Stories ─────────────────────────────────────────────────────────────

export const heroStoryApi = {
  getAll: () => adminCore.get<HeroStory[]>(ADMIN_ENDPOINTS.hero.stories.get),

  create: (data: Omit<HeroStory, 'id'>) =>
    adminCore.post<HeroStory>(ADMIN_ENDPOINTS.hero.stories.create, data),

  update: (id: string, data: Partial<HeroStory>) =>
    adminCore.put<HeroStory>(ADMIN_ENDPOINTS.hero.stories.update(id), data),

  delete: (id: string) =>
    adminCore.delete<{ success: boolean }>(ADMIN_ENDPOINTS.hero.stories.update(id)),
};
