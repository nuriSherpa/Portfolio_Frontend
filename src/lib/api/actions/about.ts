// src/lib/api/actions/about.ts
import { cachedFetch, invalidateCache } from '../cached-fetch';
import { ENDPOINTS } from '../endpoints';
import { AboutData } from '@/lib/types/about';

const ABOUT_CACHE_KEY = 'about';
const ABOUT_CACHE_TTL = 3600; // 1 hour

export async function getAbout() {
  try {
    const about = await cachedFetch<AboutData>({
      url: ENDPOINTS.about,
      key: ABOUT_CACHE_KEY,
      strategy: 'memory',
      ttl: ABOUT_CACHE_TTL,
      tags: ['about', 'profile'],
      parser: (result) => {
        if (!result?.success) {
          throw new Error(result?.message || 'API returned unsuccessful response');
        }
        if (!result?.data) {
          throw new Error('No about data received');
        }
        return result.data;
      },
    });

    return {
      success: true,
      about,
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      about: null,
      error: error.message,
    };
  }
}

// For admin updates - invalidate cache and fetch fresh
export async function refreshAbout() {
  invalidateCache(ABOUT_CACHE_KEY);
  return getAbout();
}

// Force fresh fetch (no cache)
export async function getAboutFresh() {
  try {
    const about = await cachedFetch<AboutData>({
      url: ENDPOINTS.about,
      key: `${ABOUT_CACHE_KEY}:fresh`,
      strategy: 'no-cache',
      parser: (result) => {
        if (!result?.success) throw new Error('API returned unsuccessful');
        return result.data;
      },
    });

    return {
      success: true,
      about,
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      about: null,
      error: error.message,
    };
  }
}
