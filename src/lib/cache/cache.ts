// src/lib/cache/cache.ts
const DB_NAME = 'portfolio-cache-v5';
const STORE_NAME = 'data';
const DB_VERSION = 1;
const CACHE_VERSION_KEY = 'app-cache-version';
const STABLE_FALLBACK_VERSION = 1; // fixed fallback — never use Date.now()

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: number;
}

class GlobalCache {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private static instance: GlobalCache;
  private currentVersion: number = STABLE_FALLBACK_VERSION;

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

  private async checkAndClearIfStale(): Promise<void> {
    try {
      const storedVersion = await this.get<number>(CACHE_VERSION_KEY);
      const serverVersion = await this.fetchServerVersion();

      // Only clear if we have a stored version AND it differs from server
      // If server version fetch failed (returned fallback), don't clear
      if (storedVersion !== null && storedVersion !== serverVersion) {
        console.log(
          `[Client Cache] Version mismatch (${storedVersion} → ${serverVersion}), clearing cache`,
        );
        await this.clear();
      }

      this.currentVersion = serverVersion;
      await this.set(CACHE_VERSION_KEY, serverVersion, 1000 * 60 * 60 * 24);
    } catch (e) {
      console.error('[Client Cache] Version check error:', e);
      // On any error, keep using the stable fallback — never wipe the cache
    }
  }

  private async fetchServerVersion(): Promise<number> {
    try {
      const res = await fetch('/api/cache-version', {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      // Only trust the response if the endpoint actually exists
      if (res.ok) {
        const data = await res.json();
        return data.version || STABLE_FALLBACK_VERSION;
      }

      // 404 or other error — endpoint doesn't exist, use stable fallback
      console.log(
        `[Client Cache] /api/cache-version returned ${res.status}, using stable fallback`,
      );
      return STABLE_FALLBACK_VERSION;
    } catch (e) {
      console.log('[Client Cache] Could not fetch server version, using stable fallback');
      return STABLE_FALLBACK_VERSION;
    }
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
