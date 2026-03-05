// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { memoryCache, invalidateCache, clearCache, getCacheStats } from '@/lib/api/cached-fetch';

const WEBHOOK_SECRET = process.env.API_SECRET_KEY;

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret');

  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { section } = await request.json();

  if (!section) {
    return NextResponse.json({ error: 'Section required' }, { status: 400 });
  }

  // 1. Clear Next.js built-in cache using the 'max' profile
  const tags = section === 'all' ? ['hero', 'projects', 'stories'] : [section];
  tags.forEach((tag) => {
    try {
      // Use the 'max' profile which is built-in
      revalidateTag(tag, 'max');
    } catch (error) {
      console.error(`❌ Failed to revalidate tag ${tag}:`, error);
    }
  });

  // 2. Clear custom memory cache (this is your primary cache)
  let clearedCount = 0;

  if (section === 'all') {
    clearCache();
    clearedCount = memoryCache.size; // Should be 0 after clear
  } else {
    // Clear specific section and related patterns
    const patterns: Record<string, string[]> = {
      hero: ['hero'],
      projects: ['projects:list', 'projects:slug', 'projects:detail', 'projects:fresh'],
    };

    const patternsToClear = patterns[section] || [section];
    patternsToClear.forEach((pattern) => {
      const count = invalidateCache(pattern);
      clearedCount += count;
    });
  }

  return NextResponse.json({
    success: true,
    section,
    revalidatedTags: tags,
    clearedEntries: clearedCount,
    remainingCache: memoryCache.size,
    message: 'Cache cleared - fresh data on next request',
  });
}
