// src/lib/api/server-fetch.ts
'use server';

import { createServerClient } from './server';
import { persistentCache } from '../utils/persistent-cache';

// In-flight request deduplication (same request happening at same time)
const inFlight = new Map<string, Promise<any>>();

interface ServerFetchOptions {
  url: string;
  cacheKey: string;
  ttl?: number;
  // Optional: specify a path to extract data from response
  dataPath?: string; // e.g., 'data.hero' or just 'data'
}

export async function serverFetch<T>({
  url,
  cacheKey,
  ttl = 5 * 60 * 1000,
  dataPath = 'data', // Default to 'data' for backward compatibility
}: ServerFetchOptions) {
  // Check persistent cache first
  const cached = await persistentCache.get<T>(cacheKey);
  if (cached) {
    console.log(`[Server Cache HIT] ${cacheKey}`);
    return { data: cached, fromCache: true };
  }

  // Deduplicate in-flight requests (same request happening at same time)
  if (inFlight.has(cacheKey)) {
    console.log(`[Server DEDUPE] Reusing in-flight request: ${cacheKey}`);
    return inFlight.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      console.log(`[Server FETCH] ${cacheKey}`);
      const client = await createServerClient();
      const response = await client.get(url);

      // Extract data based on the provided path
      let actualData: T;

      if (dataPath === 'data') {
        // Default behavior: response.data.data
        actualData = response.data.data;
      } else {
        // Navigate nested path (e.g., 'data.hero')
        actualData = dataPath.split('.').reduce((obj, key) => obj?.[key], response.data);
      }

      console.log(
        `[Server Fetch] ${cacheKey}:`,
        typeof actualData,
        Array.isArray(actualData) ? actualData.length : 'object',
        dataPath !== 'data' ? `(extracted from ${dataPath})` : '',
      );

      // Store actual data in cache
      await persistentCache.set(cacheKey, actualData, ttl);

      return { data: actualData as T, fromCache: false };
    } finally {
      // Clean up in-flight after completion
      inFlight.delete(cacheKey);
    }
  })();

  inFlight.set(cacheKey, promise);
  return promise;
}
