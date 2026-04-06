// src/lib/api/cached-fetch.ts

type CacheStrategy = 'no-cache' | 'memory' | 'disk' | 'isr';

type CachedFetchOptions<T> = {
  url: string;
  key: string;
  strategy?: CacheStrategy;
  ttl?: number;
  tags?: string[];
  parser?: (data: any) => T;
};

// Server-side only — use API_URL directly, not the browser proxy
const API_BASE_URL =
  typeof window === 'undefined'
    ? process.env.API_URL || 'http://localhost:9090/api/v1' // SSR / Server Actions
    : process.env.NEXT_PUBLIC_API_URL || '/api/v1'; // Client-side (goes through Next.js rewrite)

function buildFullUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${path}`;
}

// Everything on globalThis so Turbopack hot reload never resets them
if (!(globalThis as any).__MEMORY_CACHE__) {
  (globalThis as any).__MEMORY_CACHE__ = new Map<string, { data: any; expiry: number }>();
}
if (!(globalThis as any).__INFLIGHT_CACHE__) {
  (globalThis as any).__INFLIGHT_CACHE__ = new Map<string, Promise<any>>();
}
if (!(globalThis as any).__CACHE_CLEANER__) {
  (globalThis as any).__CACHE_CLEANER__ = setInterval(() => {
    const now = Date.now();
    const s: Map<string, { data: any; expiry: number }> = (globalThis as any).__MEMORY_CACHE__;
    for (const [key, val] of s.entries()) {
      if (val.expiry < now) s.delete(key);
    }
  }, 60_000);
}

const store: Map<string, { data: any; expiry: number }> = (globalThis as any).__MEMORY_CACHE__;
const inFlight: Map<string, Promise<any>> = (globalThis as any).__INFLIGHT_CACHE__;

export const memoryCache = store;

export async function cachedFetch<T>({
  url,
  key,
  strategy = 'memory',
  ttl = 3600,
  parser = (d) => d,
}: CachedFetchOptions<T>): Promise<T> {
  const fullUrl = buildFullUrl(url);
  const cacheKey = `${key}:${fullUrl}`;

  if (strategy === 'no-cache') {
    const res = await fetch(fullUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parser(await res.json());
  }

  if (strategy === 'memory') {
    // 1. Persistent store hit
    const cached = store.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      console.log(`[Server Cache HIT] ${cacheKey}`);
      return cached.data as T;
    }

    // 2. Deduplicate concurrent requests for the same key
    if (inFlight.has(cacheKey)) {
      console.log(`[Server Cache INFLIGHT] ${cacheKey}`);
      return inFlight.get(cacheKey) as Promise<T>;
    }

    // 3. Fetch from backend, cache result
    const promise = (async () => {
      try {
        console.log(`[Server Cache MISS] ${cacheKey}`);
        const res = await fetch(fullUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const parsed = parser(await res.json());
        store.set(cacheKey, { data: parsed, expiry: Date.now() + ttl * 1000 });
        return parsed;
      } finally {
        inFlight.delete(cacheKey);
      }
    })();

    inFlight.set(cacheKey, promise);
    return promise;
  }

  if (strategy === 'disk' || strategy === 'isr') {
    const res = await fetch(fullUrl, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parser(await res.json());
  }

  throw new Error(`Unknown cache strategy: ${strategy}`);
}

export function invalidateCache(keyPattern: string): number {
  let count = 0;
  for (const key of store.keys()) {
    if (key.includes(keyPattern)) {
      store.delete(key);
      console.log(`[Cache INVALIDATED] ${key}`);
      count++;
    }
  }
  console.log(`[Cache INVALIDATED] Total: ${count} for pattern: ${keyPattern}`);
  return count;
}

export function clearCache(): void {
  const size = store.size;
  store.clear();
  console.log(`[Cache CLEARED] ${size} entries removed`);
}

export function getCacheStats() {
  return {
    size: store.size,
    keys: Array.from(store.keys()).slice(0, 10),
  };
}
