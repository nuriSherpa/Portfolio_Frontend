import { useState, useEffect, useCallback, useRef } from 'react';
import { getLikedStatus, PublicStats } from '@/lib/api/actions/stats';
import { useLiveStats } from './use-live-stats';

const CACHE_KEY = '_stats_cache';
const FALLBACK: PublicStats = { visitors: 0, projects: 0, likes: 0 };

const readCache = (): PublicStats | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCache = (stats: PublicStats) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(stats));
  } catch {}
};

export const useStats = (serverStats: PublicStats) => {
  const safe = serverStats ?? FALLBACK;
  console.log('[useStats] serverStats:', serverStats);

  // Always init from serverStats — no SSR/client mismatch
  const [stats, setStats] = useState<PublicStats>(safe);
  const [prevStats, setPrevStats] = useState<PublicStats>(safe);
  const [changedFields, setChangedFields] = useState<Set<keyof PublicStats>>(new Set());
  const [isLiked, setIsLiked] = useState(false);

  const hasMounted = useRef(false);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerAnimation = useCallback((prev: PublicStats, next: PublicStats) => {
    if (!prev || !next) return;
    const changed = new Set<keyof PublicStats>();
    (Object.keys(next) as Array<keyof PublicStats>).forEach((key) => {
      if (next[key] !== prev[key]) changed.add(key);
    });
    if (changed.size === 0) return;
    setPrevStats(prev);
    setChangedFields(changed);
    if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    animationTimerRef.current = setTimeout(() => setChangedFields(new Set()), 1000);
  }, []);

  useEffect(() => {
    hasMounted.current = true;
    setIsLiked(getLikedStatus());

    const cached = readCache();
    console.log('[useStats] cached:', cached, 'safe:', safe);

    if (cached) {
      const hasDiff = (Object.keys(safe) as Array<keyof PublicStats>).some(
        (key) => safe[key] !== cached[key],
      );
      if (hasDiff) {
        // Show cached first, then animate to fresh serverStats
        setStats(cached);
        setPrevStats(cached);
        setTimeout(() => {
          triggerAnimation(cached, safe);
          setStats(safe);
        }, 300);
      } else {
        // Same data — just show cached, no animation
        setStats(cached);
        setPrevStats(cached);
      }
    }
    // No cache → serverStats already in state from useState(safe), nothing to do

    writeCache(safe);

    return () => {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleWsUpdate = useCallback(
    (incoming: Partial<PublicStats>) => {
      if (!hasMounted.current) return;
      setStats((prev) => {
        const next = { ...prev, ...incoming };
        const hasChange = (Object.keys(incoming) as Array<keyof PublicStats>).some(
          (key) => incoming[key] !== undefined && incoming[key] !== prev[key],
        );
        if (!hasChange) return prev;
        writeCache(next);
        triggerAnimation(prev, next);
        return next;
      });
    },
    [triggerAnimation],
  );

  useLiveStats(handleWsUpdate);

  const updateStats = useCallback(
    (incoming: Partial<PublicStats>) => {
      setStats((prev) => {
        const next = { ...prev, ...incoming };
        writeCache(next);
        triggerAnimation(prev, next);
        return next;
      });
    },
    [triggerAnimation],
  );

  return { stats, prevStats, changedFields, isLiked, setIsLiked, updateStats };
};
