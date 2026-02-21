// src/lib/api/actions/story.ts
'use server';

export interface Story {
  id: string;
  image: string;
  caption?: string;
  uploadedAt: string;
}

export async function getHeroStories() {
  // Check environment variables
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  console.log('[DEBUG] Environment variables:');
  console.log('  API_URL:', process.env.API_URL || 'undefined');
  console.log('  NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'undefined');
  console.log('  Final URL:', apiUrl);

  if (!apiUrl) {
    return {
      success: false,
      stories: [] as Story[],
      error: 'API_URL not configured in environment variables',
    };
  }

  const fullUrl = `${apiUrl}/hero/stories`;
  console.log('[DEBUG] Fetching:', fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    console.log('[DEBUG] Response status:', response.status);
    console.log('[DEBUG] Content-Type:', response.headers.get('content-type'));

    // Get raw text first
    const text = await response.text();
    console.log('[DEBUG] Raw response (first 500 chars):', text.slice(0, 500));

    // Check if HTML
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.error('[DEBUG] ERROR: Received HTML instead of JSON!');
      console.error('[DEBUG] This means the URL is wrong or backend is not running');

      return {
        success: false,
        stories: [] as Story[],
        error: `Backend returned HTML. Is ${apiUrl} the correct API URL?`,
      };
    }

    // Parse JSON
    const data = JSON.parse(text);
    console.log('[DEBUG] Parsed data:', data);

    return {
      success: true,
      stories: data.data || [],
      count: data.count || 0,
      error: null,
    };
  } catch (error: any) {
    console.error('[DEBUG] Fetch error:', error.message);
    return {
      success: false,
      stories: [] as Story[],
      error: error.message,
    };
  }
}
