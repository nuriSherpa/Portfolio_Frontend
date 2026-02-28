// src/lib/api/actions/hero.ts
import { serverFetch } from '../server-fetch';
import { ENDPOINTS } from '../endpoints';
import { HeroSection } from '@/lib/types/models';

export async function getHero() {
  try {
    // API returns { success: boolean, data: HeroSection }
    const result = await serverFetch<{ success: boolean; data: HeroSection }>({
      url: ENDPOINTS.hero,
    });

    if (result.error) {
      console.error('[getHero] Error:', result.error);
      return {
        success: false,
        hero: null,
        error: result.error,
      };
    }

    // Check if API response has success flag
    if (!result.data?.success) {
      return {
        success: false,
        hero: null,
        error: 'API returned unsuccessful response',
      };
    }

    // Extract the hero data from the nested structure
    const hero = result.data.data;

    if (!hero) {
      return {
        success: false,
        hero: null,
        error: 'No hero data received',
      };
    }

    return {
      success: true,
      hero,
      error: null,
    };
  } catch (error: any) {
    console.error('[getHero] Error:', error.message);
    return {
      success: false,
      hero: null,
      error: error.message,
    };
  }
}
