// src/lib/api/cached-fetch.ts
import { cache } from 'react';

type CacheStrategy = 'no-cache' | 'memory' | 'disk' | 'isr';

type CachedFetchOptions<T> = {
  url: string;
  key: string;
  strategy?: CacheStrategy;
  ttl?: number;
  tags?: string[]; // Kept for compatibility but not used in fetch
  parser?: (data: any) => T;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/api/v1';

// GLOBAL cache - shared across all Next.js module instances
const globalCache =
  (globalThis as any).__MEMORY_CACHE__ || new Map<string, { data: any; expiry: number }>();

(globalThis as any).__MEMORY_CACHE__ = globalCache;

export const memoryCache = globalCache;

// Clean expired entries periodically
if (typeof globalThis !== 'undefined' && !(globalThis as any).__CACHE_CLEANER__) {
  (globalThis as any).__CACHE_CLEANER__ = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of globalCache.entries()) {
      if (value.expiry < now) {
        globalCache.delete(key);
      }
    }
  }, 60000);
}

function buildFullUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${path}`;
}

export async function cachedFetch<T>({
  url,
  key,
  strategy = 'memory',
  ttl = 3600,
  parser = (d) => d,
}: CachedFetchOptions<T>): Promise<T> {
  const fullUrl = buildFullUrl(url);
  const cacheKey = `${key}:${fullUrl}`;

  // For no-cache strategy, always fetch fresh
  if (strategy === 'no-cache') {
    const response = await fetch(fullUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return parser(await response.json());
  }

  // For memory strategy, use our in-memory cache
  if (strategy === 'memory') {
    const cached = globalCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return cached.data;
    }

    console.log(`[Cache MISS] ${cacheKey}`);

    // Always use no-store for the actual fetch to avoid Next.js cache
    const response = await fetch(fullUrl, {
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const parsed = parser(data);

    globalCache.set(cacheKey, {
      data: parsed,
      expiry: Date.now() + ttl * 1000,
    });

    return parsed;
  }

  // For disk/isr strategies, use Next.js cache but without tags that trigger cacheLife
  if (strategy === 'disk' || strategy === 'isr') {
    // Use force-cache but don't pass any next options that might trigger cacheLife
    const response = await fetch(fullUrl, {
      cache: 'force-cache',
      // No 'next' object at all
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return parser(await response.json());
  }

  throw new Error(`Unknown cache strategy: ${strategy}`);
}

// Clear cache by pattern
export function invalidateCache(keyPattern: string): number {
  let count = 0;
  const keysToDelete: string[] = [];

  // First collect keys to delete
  for (const key of globalCache.keys()) {
    if (key.includes(keyPattern)) {
      keysToDelete.push(key);
    }
  }

  // Then delete them
  keysToDelete.forEach((key) => {
    globalCache.delete(key);
    console.log(`[Cache INVALIDATED] ${key}`);
    count++;
  });

  console.log(`[Cache INVALIDATED] Total: ${count} entries for pattern: ${keyPattern}`);
  return count;
}

// Clear ALL cache
export function clearCache(): void {
  const size = globalCache.size;
  globalCache.clear();
  console.log(`[Cache CLEARED] ${size} entries removed`);
}

// Get cache stats for debugging
export function getCacheStats() {
  return {
    size: globalCache.size,
    keys: Array.from(globalCache.keys()).slice(0, 10),
  };
}
