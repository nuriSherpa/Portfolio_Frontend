// Smart cache with TTL and size limits
class SmartCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly maxSize = 50; // Max 50 items
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes default

  // Cache configuration by endpoint
  private readonly config: Map<string, { ttl: number; persistent: boolean }> = new Map([
    ['hero', { ttl: 2 * 60 * 1000, persistent: false }], // 2 minutes, memory only
    ['projects', { ttl: 5 * 60 * 1000, persistent: false }], // 5 minutes, memory only
    ['project:', { ttl: 10 * 60 * 1000, persistent: false }], // 10 minutes per project
    ['blogs', { ttl: 3 * 60 * 1000, persistent: false }], // 3 minutes
    ['blog:', { ttl: 10 * 60 * 1000, persistent: false }], // 10 minutes per blog
    ['about', { ttl: 30 * 60 * 1000, persistent: false }], // 30 minutes, rarely changes
  ]);

  private getConfig(key: string): { ttl: number; persistent: boolean } {
    // Check exact match first
    if (this.config.has(key)) {
      return this.config.get(key)!;
    }
    // Check prefix match (for dynamic routes like project:slug)
    for (const [prefix, conf] of this.config) {
      if (key.startsWith(prefix)) {
        return conf;
      }
    }
    return { ttl: this.defaultTTL, persistent: false };
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  set(key: string, data: any, customTTL?: number): void {
    // Enforce max size (LRU eviction)
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const config = this.getConfig(key);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTTL || config.ttl,
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  // For debugging
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const smartCache = new SmartCache();
