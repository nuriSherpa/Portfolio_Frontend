// src/hooks/use-projects-cache.ts
'use client';

import { useRef, useCallback } from 'react';
import { Project } from '@/lib/types/models';

interface CacheEntry {
  projects: Project[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
  };
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useProjectsCache() {
  const cacheRef = useRef<Map<number, CacheEntry>>(new Map());

  const getCachedPage = useCallback((page: number): CacheEntry | null => {
    const entry = cacheRef.current.get(page);
    if (!entry) return null;

    // Check if cache is still valid
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      cacheRef.current.delete(page);
      return null;
    }

    return entry;
  }, []);

  const setCachedPage = useCallback((page: number, entry: Omit<CacheEntry, 'timestamp'>) => {
    cacheRef.current.set(page, {
      ...entry,
      timestamp: Date.now(),
    });
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    getCachedPage,
    setCachedPage,
    clearCache,
  };
}
