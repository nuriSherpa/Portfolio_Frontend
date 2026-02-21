// src/lib/api/actions/hero.ts
'use server';

import { serverFetch } from '../server-fetch';
import { HeroSection } from '@/lib/types/models';

export async function getHero() {
  try {
    const result = await serverFetch<{ success: boolean; data: HeroSection }>({
      url: '/hero',
      method: 'GET',
    });

    if (result.error || !result.data?.data) {
      console.error('[getHero] Failed:', result.error);
      return {
        success: false,
        hero: null,
        error: result.error || 'No hero data received',
      };
    }

    const hero = result.data.data;

    // Backend now returns full URL, just log it
    console.log('[getHero] Profile image:', hero.profileImage);

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
