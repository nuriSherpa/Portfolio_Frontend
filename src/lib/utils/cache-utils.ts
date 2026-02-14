// src/lib/api/cache-utils.ts
import { cache } from '@/lib/cache/simple-cache';

interface CacheOptions {
  ttl?: number;
  forceRefresh?: boolean;
}

export class ApiCache {
  static async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T & { fromCache: boolean }> {
    // Force refresh if requested
    if (options.forceRefresh) {
      const freshData = await fetchFn();
      cache.set(key, freshData, options.ttl);
      return { ...freshData, fromCache: false };
    }

    // Try cache first
    const cached = cache.get<T>(key);
    if (cached !== null) {
      return { ...cached, fromCache: true };
    }

    // Fetch fresh data
    const freshData = await fetchFn();
    cache.set(key, freshData, options.ttl);
    return { ...freshData, fromCache: false };
  }

  static invalidate(key: string | string[]): void {
    if (Array.isArray(key)) {
      key.forEach((k) => cache.delete(k));
    } else {
      cache.delete(key);
    }
  }

  // Predefined cache keys for portfolio
  static keys = {
    hero: 'hero',
    projects: 'projects',
    project: (id: string) => `project:${id}`,
    blogs: 'blogs',
    blog: (id: string) => `blog:${id}`,
    about: 'about',
    skills: 'skills',
  };
}
