// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { memoryCache, invalidateCache, clearCache } from '@/lib/api/cached-fetch';

const WEBHOOK_SECRET = process.env.API_SECRET_KEY;

// Track client cache version (increment on each revalidation)
let clientCacheVersion = Date.now();

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret');

  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { section } = await request.json();

  if (!section) {
    return NextResponse.json({ error: 'Section required' }, { status: 400 });
  }

  // 1. Clear Next.js built-in cache (2 ARGUMENTS REQUIRED!)
  const tags = section === 'all' ? ['hero', 'projects', 'stories'] : [section];
  tags.forEach((tag) => {
    try {
      // Use 'max' profile for maximum revalidation (clears immediately)
      revalidateTag(tag, 'max'); // ✅ 2 arguments: tag + profile
    } catch (error) {
      console.error(`❌ Failed to revalidate tag ${tag}:`, error);
    }
  });

  // 2. Clear server memory cache
  let clearedCount = 0;
  if (section === 'all') {
    clearCache();
    clearedCount = memoryCache.size;
  } else {
    const patterns: Record<string, string[]> = {
      hero: ['hero'],
      projects: ['projects:list', 'projects:slug', 'projects:detail', 'projects:fresh'],
      stories: ['stories'],
    };

    const patternsToClear = patterns[section] || [section];
    patternsToClear.forEach((pattern) => {
      const count = invalidateCache(pattern);
      clearedCount += count;
    });
  }

  // 3. Increment cache version to invalidate client caches
  clientCacheVersion = Date.now();
  console.log(`[Revalidate] New cache version: ${clientCacheVersion}`);

  return NextResponse.json({
    success: true,
    section,
    revalidatedTags: tags,
    clearedEntries: clearedCount,
    remainingCache: memoryCache.size,
    cacheVersion: clientCacheVersion,
    message: 'Cache cleared - fresh data on next request',
  });
}

// Export for client to check
export function getCacheVersion() {
  return clientCacheVersion;
}
