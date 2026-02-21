// src/lib/utils/page-cache.ts
interface PageCacheData {
  projects: any[];
  pagination: any;
  scrollPosition: number;
  timestamp: number;
}

class PageCache {
  private cacheKey = 'projects-page-cache';
  private expiryTime = 5 * 60 * 1000; // 5 minutes

  save(data: PageCacheData) {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.setItem(
        this.cacheKey,
        JSON.stringify({
          ...data,
          timestamp: Date.now(),
        }),
      );
    } catch (e) {
      // If quota exceeded, clear old items
      sessionStorage.clear();
    }
  }

  load(): PageCacheData | null {
    if (typeof window === 'undefined') return null;

    try {
      const cached = sessionStorage.getItem(this.cacheKey);
      if (!cached) return null;

      const data = JSON.parse(cached);

      // Check if cache is expired
      if (Date.now() - data.timestamp > this.expiryTime) {
        sessionStorage.removeItem(this.cacheKey);
        return null;
      }

      return data;
    } catch (e) {
      return null;
    }
  }

  clear() {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(this.cacheKey);
  }
}

export const pageCache = new PageCache();
