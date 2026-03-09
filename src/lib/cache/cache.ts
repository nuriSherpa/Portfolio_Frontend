// src/lib/cache/cache.ts
const DB_NAME = 'portfolio-cache-v5'; // Bumped version to force clear old caches
const STORE_NAME = 'data';
const DB_VERSION = 1;
const CACHE_VERSION_KEY = 'app-cache-version';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: number; // Added version field
}

class GlobalCache {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private static instance: GlobalCache;
  private currentVersion: number = 0;

  static getInstance(): GlobalCache {
    if (!GlobalCache.instance) {
      GlobalCache.instance = new GlobalCache();
    }
    return GlobalCache.instance;
  }

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = async () => {
        this.db = request.result;
        // Check version and clear if stale
        await this.checkAndClearIfStale();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });

    return this.initPromise;
  }

  // Check server cache version and clear if different
  private async checkAndClearIfStale(): Promise<void> {
    try {
      // Get stored version
      const storedVersion = await this.get<number>(CACHE_VERSION_KEY);

      // Fetch current server version
      const serverVersion = await this.fetchServerVersion();

      if (storedVersion && storedVersion !== serverVersion) {
        console.log(
          `[Client Cache] Version mismatch (${storedVersion} → ${serverVersion}), clearing cache`,
        );
        await this.clear();
      }

      // Update to current version
      this.currentVersion = serverVersion;
      await this.set(CACHE_VERSION_KEY, serverVersion, 1000 * 60 * 60 * 24); // 24h TTL
    } catch (e) {
      console.error('[Client Cache] Version check error:', e);
    }
  }

  // Fetch current cache version from server
  private async fetchServerVersion(): Promise<number> {
    try {
      const res = await fetch('/api/cache-version', {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        return data.version || Date.now();
      }
    } catch (e) {
      // Server not available, use timestamp as fallback
      console.log('[Client Cache] Could not fetch server version, using local timestamp');
    }
    return Date.now();
  }

  async get<T>(key: string): Promise<T | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          const entry: CacheEntry<T> | undefined = request.result;
          if (!entry) {
            resolve(null);
            return;
          }

          // Check TTL expiration
          const isExpired = Date.now() - entry.timestamp > entry.ttl;
          if (isExpired) {
            this.delete(key);
            resolve(null);
            return;
          }

          resolve(entry.data);
        };

        request.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  async set<T>(key: string, data: T, ttl: number = 1000 * 60 * 60): Promise<void> {
    await this.init();
    if (!this.db) return;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: this.currentVersion,
    };

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(entry, key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (e) {
        reject(e);
      }
    });
  }

  async delete(key: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    try {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(key);
    } catch (e) {
      // Ignore
    }
  }

  // Clear all cache entries
  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
          console.log('[Client Cache] All entries cleared');
          resolve();
        };
        request.onerror = () => reject(request.error);
      } catch (e) {
        reject(e);
      }
    });
  }
}

export const globalCache = GlobalCache.getInstance();
