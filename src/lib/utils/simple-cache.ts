// src/lib/cache/simple-cache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  // Cache configuration for different types of data
  private config = {
    hero: { ttl: 2 * 60 * 1000 }, // 2 minutes
    projects: { ttl: 10 * 60 * 1000 }, // 10 minutes
    project: { ttl: 30 * 60 * 1000 }, // 30 minutes per project
    blogs: { ttl: 10 * 60 * 1000 }, // 10 minutes
    blog: { ttl: 30 * 60 * 1000 }, // 30 minutes per blog
    about: { ttl: 60 * 60 * 1000 }, // 1 hour
    skills: { ttl: 60 * 60 * 1000 }, // 1 hour
  };

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    console.log(`[Cache HIT] ${key}`);
    return entry.data;
  }

  set<T>(key: string, data: T, customTTL?: number): void {
    // Get TTL from config or use default
    let ttl = this.defaultTTL;

    if (customTTL) {
      ttl = customTTL;
    } else {
      // Try to match with config
      for (const [prefix, config] of Object.entries(this.config)) {
        if (key.startsWith(prefix)) {
          ttl = config.ttl;
          break;
        }
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    this.cache.set(key, entry);
    console.log(`[Cache SET] ${key} (TTL: ${Math.round(ttl / 60000)} minutes)`);
  }

  delete(key: string): void {
    this.cache.delete(key);
    console.log(`[Cache DELETE] ${key}`);
  }

  deleteByPrefix(prefix: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    console.log(`[Cache DELETE PREFIX] ${prefix} (${keysToDelete.length} items)`);
  }

  clear(): void {
    this.cache.clear();
    console.log('[Cache CLEAR] All cache cleared');
  }

  getStats() {
    const now = Date.now();
    let expiredCount = 0;

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++;
      }
    }

    return {
      total: this.cache.size,
      expired: expiredCount,
      valid: this.cache.size - expiredCount,
    };
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
    }

    if (expiredKeys.length > 0) {
      console.log(`[Cache CLEANUP] Removed ${expiredKeys.length} expired entries`);
    }
  }
}

// Singleton instance
export const cache = new SimpleCache();

// Setup automatic cleanup every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 60 * 1000);
}
