// src/lib/api/actions/story.ts
import { serverFetch } from '../server-fetch';
import { ENDPOINTS } from '../endpoints';
import { Story } from '@/lib/types/models';

export async function getHeroStories() {
  try {
    // API returns { success: boolean; count: number; data: Story[] }
    const result = await serverFetch<{ success: boolean; count: number; data: Story[] }>({
      url: ENDPOINTS.heroStories,
    });

    if (result.error) {
      console.error('[getHeroStories] Error:', result.error);
      return {
        success: false,
        stories: [],
        error: result.error,
      };
    }

    // Check if API response has success flag
    if (!result.data?.success) {
      return {
        success: false,
        stories: [],
        error: 'API returned unsuccessful response',
      };
    }

    // Extract the stories array from the nested structure
    const stories = result.data.data || [];

    return {
      success: true,
      stories,
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
