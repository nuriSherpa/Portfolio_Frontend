// src/hooks/use-smart-prefetch.ts
'use client';

import { useRef, useCallback, useEffect } from 'react';
import { globalCache } from '@/lib/cache/cache';
import { getImageUrl } from '@/lib/utils/image-url';

const CACHE_KEY = (slug: string) => `project-detail-${slug}`;

// Desktop: only prefetch after hovering this long (user has paused on card)
const HOVER_INTENT_DELAY = 400;

// Mobile: only prefetch after card has been in center viewport for this long
// (user has stopped scrolling and is reading the card)
const MOBILE_DWELL_DELAY = 800;

// Mobile: how long scroll must be idle before we consider user has stopped
const SCROLL_IDLE_DELAY = 300;

const fetchingSet = new Set<string>();

const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth < 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );
};

// src/hooks/use-smart-prefetch.ts

// In use-smart-prefetch.ts, update the fetch URL:

// src/hooks/use-smart-prefetch.ts

async function prefetchProject(slug: string, title: string) {
  if (!slug || fetchingSet.has(slug)) return;

  const localCached = await globalCache.get(CACHE_KEY(slug));
  if (localCached) {
    console.log(`[Prefetch] Already cached locally: ${title}`);
    return;
  }

  fetchingSet.add(slug);
  console.log(`[Prefetch] Fetching: ${title}`);

  try {
    const res = await fetch(`/api/v1/project/${slug}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const projectData = data?.data || data;

    const normalizedProject = {
      ...projectData,
      description: projectData.description || projectData.about || projectData.content || '',
      content: projectData.content || projectData.about || projectData.description || '',
      about: projectData.about || projectData.description || '',
      hasFullContent: !!(projectData.content || projectData.about),
      hasShortDescription: !!(projectData.description || projectData.about),
    };

    await globalCache.set(CACHE_KEY(slug), normalizedProject, 1000 * 60 * 60);
    console.log(`[Prefetch] Cached (normalized): ${title}`);

    // ── Preload the actual image file into the browser cache ──
    // This is what eliminates the blink — by the time the user clicks,
    // the image is already decoded and sitting in the HTTP cache.
    if (projectData.projectImage) {
      preloadImage(getImageUrl(projectData.projectImage));
    }
  } catch (e) {
    console.error(`[Prefetch] Failed: ${title}`, e);
  } finally {
    fetchingSet.delete(slug);
  }
}

// Preload image into browser cache silently
function preloadImage(src: string) {
  if (!src) return;
  try {
    // Match exactly what next/image will request
    const optimizedUrl = `/_next/image?url=${encodeURIComponent(src)}&w=828&q=75`;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizedUrl;
    document.head.appendChild(link);

    const img = new window.Image();
    img.onload = () => {
      link.remove();
      console.log(`[Prefetch] Image preloaded: ${src}`);
    };
    img.onerror = () => link.remove();
    img.src = optimizedUrl;
  } catch (e) {}
}

export function useSmartPrefetch() {
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentSlugRef = useRef<string | null>(null);
  const isMobileRef = useRef<boolean>(false);

  useEffect(() => {
    isMobileRef.current = isMobileDevice();
    const handleResize = () => {
      isMobileRef.current = isMobileDevice();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Desktop: hover intent ──
  // Only fires if the user has genuinely paused on the card (not just
  // moving the mouse across it). If they leave before HOVER_INTENT_DELAY
  // the timeout is cleared and nothing fetches.
  const onMouseEnter = useCallback((slug: string, title: string) => {
    if (!slug || isMobileRef.current) return;

    // Cancel any pending prefetch from a previous card
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    currentSlugRef.current = slug;

    hoverTimeoutRef.current = setTimeout(() => {
      // Still hovering the same card after delay — user has intent
      if (currentSlugRef.current === slug) {
        prefetchProject(slug, title);
      }
    }, HOVER_INTENT_DELAY);
  }, []);

  const onMouseLeave = useCallback(() => {
    // User moved away — cancel the pending prefetch
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    currentSlugRef.current = null;
  }, []);

  // ── Mobile: dwell detection ──
  // Prefetch only fires when:
  // 1. Scroll has been idle for SCROLL_IDLE_DELAY (user stopped scrolling)
  // 2. A card has been centered in the viewport for MOBILE_DWELL_DELAY
  //    (user is reading it, not just passing through)
  useEffect(() => {
    if (!isMobileRef.current) return;

    // Track which card is currently centered
    const dwellTimeouts = new Map<string, NodeJS.Timeout>();
    let isScrolling = false;
    let scrollIdleTimeout: NodeJS.Timeout | null = null;

    const cancelAllDwellTimers = () => {
      dwellTimeouts.forEach((t) => clearTimeout(t));
      dwellTimeouts.clear();
    };

    const getCardCenter = (el: Element) => {
      const rect = el.getBoundingClientRect();
      return rect.top + rect.height / 2;
    };

    const isCentered = (el: Element) => {
      const center = getCardCenter(el);
      const vpCenter = window.innerHeight / 2;
      // Card must be within 35% of viewport center
      return Math.abs(vpCenter - center) < window.innerHeight * 0.35;
    };

    const startDwellTimer = (el: Element) => {
      const slug = el.getAttribute('data-slug');
      const title = el.getAttribute('data-title');
      if (!slug || !title || dwellTimeouts.has(slug)) return;

      const timeout = setTimeout(() => {
        dwellTimeouts.delete(slug);
        // Double-check card is still centered when timer fires
        if (isCentered(el)) {
          console.log(`[Mobile] Dwell detected: ${title}`);
          prefetchProject(slug, title);
        }
      }, MOBILE_DWELL_DELAY);

      dwellTimeouts.set(slug, timeout);
    };

    const checkCenteredCards = () => {
      // Don't start dwell timers while user is actively scrolling
      if (isScrolling) return;

      const cards = document.querySelectorAll('[data-slug]');
      cards.forEach((card) => {
        const slug = card.getAttribute('data-slug') ?? '';
        if (isCentered(card) && !dwellTimeouts.has(slug)) {
          startDwellTimer(card);
        } else if (!isCentered(card) && dwellTimeouts.has(slug)) {
          // Card scrolled out of center — cancel its timer
          clearTimeout(dwellTimeouts.get(slug)!);
          dwellTimeouts.delete(slug);
        }
      });
    };

    const handleScroll = () => {
      // Mark as scrolling — cancel all dwell timers immediately
      isScrolling = true;
      cancelAllDwellTimers();

      // Reset idle detection
      if (scrollIdleTimeout) clearTimeout(scrollIdleTimeout);
      scrollIdleTimeout = setTimeout(() => {
        // Scroll has been idle — user has stopped, now check what's centered
        isScrolling = false;
        checkCenteredCards();
      }, SCROLL_IDLE_DELAY);
    };

    // Initial check on mount (page load, no scroll yet)
    checkCenteredCards();

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Watch for new cards added (infinite scroll)
    const mutationObserver = new MutationObserver(() => {
      if (!isScrolling) checkCenteredCards();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAllDwellTimers();
      if (scrollIdleTimeout) clearTimeout(scrollIdleTimeout);
      window.removeEventListener('scroll', handleScroll);
      mutationObserver.disconnect();
    };
  }, []);

  return { onMouseEnter, onMouseLeave };
}
