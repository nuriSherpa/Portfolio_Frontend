// src/lib/hooks/use-local-cache.ts
'use client';

import { useCallback, useEffect, useState } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

const DB_NAME = 'portfolio-cache';
const STORE_NAME = 'projects';
const DB_VERSION = 1;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

class LocalCache {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  async get<T>(key: string): Promise<T | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry: CacheEntry<T> | undefined = request.result;
        if (!entry) {
          resolve(null);
          return;
        }

        // Check if cache is expired
        if (Date.now() - entry.timestamp > CACHE_DURATION) {
          this.delete(key); // Clean up expired
          resolve(null);
          return;
        }

        resolve(entry.data);
      };

      request.onerror = () => resolve(null);
    });
  }

  async set<T>(key: string, data: T): Promise<void> {
    await this.init();
    if (!this.db) return;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      key,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(entry, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) return;
    const transaction = this.db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(key);
  }
}

const cache = new LocalCache();

export function useLocalCache<T>() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    cache.init().then(() => setIsReady(true));
  }, []);

  const getCached = useCallback(
    async (key: string): Promise<T | null> => {
      if (!isReady) return null;
      return cache.get<T>(key);
    },
    [isReady],
  );

  const setCached = useCallback(
    async (key: string, data: T): Promise<void> => {
      if (!isReady) return;
      return cache.set(key, data);
    },
    [isReady],
  );

  return { getCached, setCached, isReady };
}
