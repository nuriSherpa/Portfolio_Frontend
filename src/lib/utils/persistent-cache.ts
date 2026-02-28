// src/lib/utils/persistent-cache.ts
import { promises as fs } from 'fs';
import path from 'path';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheData {
  [key: string]: CacheEntry<any>;
}

const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'api-cache.json');

// Eager initialization - load cache immediately
let cachePromise: Promise<Map<string, CacheEntry<any>>> | null = null;

async function loadCacheIntoMemory(): Promise<Map<string, CacheEntry<any>>> {
  const cache = new Map<string, CacheEntry<any>>();

  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const data = await fs.readFile(CACHE_FILE, 'utf-8');
    const parsed: CacheData = JSON.parse(data);

    const now = Date.now();
    for (const [key, entry] of Object.entries(parsed)) {
      // Only load non-expired entries
      if (now - entry.timestamp < entry.ttl) {
        cache.set(key, entry);
      }
    }

    console.log(`[Cache] Loaded ${cache.size} valid entries from disk`);
  } catch {
    // No cache file yet or invalid JSON
    console.log('[Cache] No existing cache file, starting fresh');
  }

  return cache;
}

// Get or create cache promise (singleton)
function getCache(): Promise<Map<string, CacheEntry<any>>> {
  if (!cachePromise) {
    cachePromise = loadCacheIntoMemory();
  }
  return cachePromise;
}

// Save cache to disk (debounced)
let saveTimeout: NodeJS.Timeout | null = null;
let currentCache: Map<string, CacheEntry<any>> | null = null;

async function saveCache(cache: Map<string, CacheEntry<any>>): Promise<void> {
  currentCache = cache;

  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(async () => {
    try {
      const data: CacheData = {};
      for (const [key, entry] of currentCache!) {
        data[key] = entry;
      }
      await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2));
      console.log(`[Cache] Saved ${currentCache!.size} entries to disk`);
    } catch (error) {
      console.error('[Cache] Failed to save:', error);
    }
  }, 500);
}

// Production-ready persistent cache
export const persistentCache = {
  async get<T>(key: string): Promise<T | null> {
    const cache = await getCache();
    const entry = cache.get(key);

    if (!entry) {
      return null;
    }

    // Check expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.delete(key);
      saveCache(cache);
      return null;
    }

    console.log(`[Cache HIT] ${key}`);
    return entry.data as T;
  },

  async set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): Promise<void> {
    const cache = await getCache();

    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Limit cache size (LRU)
    // Limit cache size (LRU)
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      // Add null check - firstKey should exist since cache.size > 100
      if (firstKey) {
        cache.delete(firstKey);
      }
    }

    saveCache(cache);

    saveCache(cache);
    console.log(`[Cache SET] ${key} (TTL: ${ttl}ms)`);
  },

  async invalidate(key: string): Promise<void> {
    const cache = await getCache();
    cache.delete(key);
    saveCache(cache);
  },

  async clear(): Promise<void> {
    const cache = await getCache();
    cache.clear();
    try {
      await fs.unlink(CACHE_FILE);
    } catch {
      // Ignore if doesn't exist
    }
  },
};
