// src/lib/api/actions/story.ts
import { serverFetch } from '../server-fetch';
import { Story } from '@/lib/types/models';

interface StoriesApiResponse {
  success: boolean;
  count: number;
  data: Story[];
}

/**
 * Fetch hero stories using serverFetch - no caching
 */
export async function getHeroStories() {
  try {
    console.log('[getHeroStories] Fetching from endpoint: /hero/stories');

    const result = await serverFetch<StoriesApiResponse>({
      url: '/hero/stories', // Just the path - serverFetch adds the base URL
      method: 'GET',
    });

    if (result.error) {
      throw new Error(result.error);
    }

    if (!result.data?.success) {
      throw new Error('API returned unsuccessful response');
    }

    return {
      success: true,
      stories: result.data.data || [],
      error: null,
    };
  } catch (error: any) {
    console.error('[getHeroStories] Error:', error.message);
    return {
      success: false,
      stories: [],
      error: error.message,
    };
  }
}

/**
 * Alias for getHeroStories - always fresh
 */
export const getHeroStoriesFresh = getHeroStories;

/**
 * No-op function for compatibility (does nothing)
 */
export function invalidateStoriesCache() {
  console.log('[invalidateStoriesCache] No-op - caching disabled');
  // Do nothing - caching is removed
}
