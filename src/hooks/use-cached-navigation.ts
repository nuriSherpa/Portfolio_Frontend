// src/hooks/use-cached-navigation.ts
'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { globalCache } from '@/lib/cache/cache';
import { getImageUrl } from '@/lib/utils/image-url';

const NAVIGATING_KEY = 'projects-navigating-to-detail';
const SCROLL_POS_KEY = 'projects-scroll-position';
const CACHE_FROM_LOCAL_KEY = 'projects-detail-from-local';

// Preload the exact URL next/image will request
// w=828 matches sizes="(max-width: 1024px) 100vw, 50vw" on a 1440px screen
function preloadNextImage(originalSrc: string): Promise<void> {
  return new Promise((resolve) => {
    const optimizedUrl = `/_next/image?url=${encodeURIComponent(originalSrc)}&w=828&q=75`;
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // resolve anyway, don't block navigation
    img.src = optimizedUrl;

    // Don't wait more than 500ms — navigate regardless
    setTimeout(resolve, 500);
  });
}

export function useCachedNavigation() {
  const router = useRouter();

  const navigateToProject = useCallback(
    async (slug: string, e?: React.MouseEvent) => {
      if (e) e.preventDefault();

      sessionStorage.setItem(SCROLL_POS_KEY, window.scrollY.toString());
      sessionStorage.setItem(NAVIGATING_KEY, 'true');

      const cacheKey = `project-detail-${slug}`;
      const cached = await globalCache.get<any>(cacheKey);

      if (cached) {
        sessionStorage.setItem(CACHE_FROM_LOCAL_KEY, JSON.stringify({ slug, data: cached }));

        // Preload image before navigating if not already in browser cache
        if (cached.projectImage) {
          await preloadNextImage(getImageUrl(cached.projectImage));
        }
      } else {
        sessionStorage.removeItem(CACHE_FROM_LOCAL_KEY);
      }

      router.push(`/projects/${slug}`);
    },
    [router],
  );

  return { navigateToProject };
}
