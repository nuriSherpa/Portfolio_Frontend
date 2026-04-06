// No 'use server' — this runs in the browser only
import { get, post } from '../client-fetch';
import { ENDPOINTS } from '../endpoints';
import { readBestPayload } from '@/lib/fingerprint';
import { initVisitor } from './visitor';

export interface PublicStats {
  visitors: number;
  likes: number;
  projects: number;
}

export interface LikeResponse {
  liked: boolean;
  alreadyLiked: boolean;
}

export const LIKED_KEY = '_hero_liked';

// Fresh fetch from backend — no caching
export const getPublicStats = async (): Promise<PublicStats> => {
  try {
    const data = await get<PublicStats>(ENDPOINTS.heroStats);
    return {
      visitors: data?.visitors || 0,
      projects: data?.projects || 0,
      likes: data?.likes || 0,
    };
  } catch {
    return { visitors: 0, projects: 0, likes: 0 };
  }
};

export const getLikedStatus = (): boolean => {
  try {
    return localStorage.getItem(LIKED_KEY) === 'true';
  } catch {
    return false;
  }
};

export const toggleLike = async (): Promise<LikeResponse> => {
  await initVisitor();

  const payload = readBestPayload();
  if (!payload?.fingerprint) {
    throw new Error('No fingerprint — visitor not initialized');
  }

  const data = await post<{ alreadyLiked: boolean }>(ENDPOINTS.heroLike, {
    fingerprint: payload.fingerprint,
  });

  localStorage.setItem(LIKED_KEY, 'true');

  return {
    alreadyLiked: data.alreadyLiked,
    liked: !data.alreadyLiked,
  };
};
