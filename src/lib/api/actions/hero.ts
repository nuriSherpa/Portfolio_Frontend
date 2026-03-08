// src/lib/api/actions/hero.ts
import { cachedFetch, invalidateCache } from '../cached-fetch';
import { ENDPOINTS } from '../endpoints';
import { HeroSection } from '@/lib/types/models';

const HERO_CACHE_KEY = 'hero';
const HERO_CACHE_TTL = 3600; // 1 hour

export async function getHero() {
  try {
    const hero = await cachedFetch<HeroSection>({
      url: ENDPOINTS.hero,
      key: HERO_CACHE_KEY,
      strategy: 'memory',
      ttl: HERO_CACHE_TTL,
      tags: ['hero', 'homepage'],
      parser: (result) => {
        // Handle your API response structure
        if (!result?.success) {
          throw new Error(result?.message || 'API returned unsuccessful response');
        }
        if (!result?.data) {
          throw new Error('No hero data received');
        }
        return result.data;
      },
    });

    return {
      success: true,
      hero,
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      hero: null,
      error: error.message,
    };
  }
}

// For admin updates - invalidate cache and fetch fresh
export async function refreshHero() {
  invalidateCache(HERO_CACHE_KEY);
  return getHero();
}

// Force fresh fetch (no cache)
export async function getHeroFresh() {
  try {
    const hero = await cachedFetch<HeroSection>({
      url: ENDPOINTS.hero,
      key: `${HERO_CACHE_KEY}:fresh`,
      strategy: 'no-cache',
      parser: (result) => {
        if (!result?.success) throw new Error('API returned unsuccessful');
        return result.data;
      },
    });

    return {
      success: true,
      hero,
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      hero: null,
      error: error.message,
    };
  }
}
