// src/lib/api/actions/hero.ts
'use server';

import { serverFetch } from '../server-fetch';
import { ENDPOINTS } from '../endpoints';
import { persistentCache } from '../../utils/persistent-cache';
import { HeroSection } from '@/lib/types/models';

const CACHE_KEY = 'hero';
const CACHE_TTL = 2 * 60 * 1000;

// Clear any existing bad cache on module load
persistentCache.invalidate(CACHE_KEY).catch(console.error);

export async function getHero() {
  try {
    const { data: hero, fromCache } = await serverFetch<HeroSection>({
      url: ENDPOINTS.hero,
      cacheKey: CACHE_KEY,
      ttl: CACHE_TTL,
      dataPath: 'data.hero', // Extract from response.data.data.hero
    });

    console.log('[getHero] Result:', {
      heroName: hero?.name,
      fromCache,
      hasHero: !!hero,
    });

    if (!hero) {
      console.error('[getHero] No hero data received');
      return {
        success: false,
        hero: null,
        error: 'No hero data received',
        fromCache,
      };
    }

    return {
      success: true,
      hero,
      error: null,
      fromCache,
    };
  } catch (error: any) {
    console.error('[getHero] Error:', error.message);

    // Clear bad cache on error
    await persistentCache.invalidate(CACHE_KEY).catch(console.error);

    return {
      success: false,
      hero: null,
      error: error.message,
      fromCache: false,
    };
  }
}
