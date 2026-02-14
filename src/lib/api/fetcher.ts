// src/lib/api/fetcher.ts
import api from './axios';
import { handleApiError, ApiError } from '../utils/api-error';
import { waitForVisitor } from '@/hooks/use-visitor';
import { rateLimiter } from '../utils/rate-limiter';
import { persistentCache } from '../utils/persistent-cache';
import { createRequestKey, shouldBlockRequest, debounceRequest } from '../utils/request-manager';

let isUserIdle = false;
export function setUserIdle(idle: boolean) {
  isUserIdle = idle;
}

interface FetchOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  requireAuth?: boolean;
  skipIdleCheck?: boolean;
  rateLimitKey?: string;
  skipCache?: boolean;
  cacheKey?: string;
  skipDebounce?: boolean;
  // NEW: Flag to indicate if running on server
  isServer?: boolean;
}

export async function safeFetch<T>({
  url,
  method = 'GET',
  data,
  requireAuth = true,
  skipIdleCheck = false,
  rateLimitKey = 'default',
  skipCache = false,
  cacheKey,
  skipDebounce = false,
  isServer = false, // Default to false (client)
}: FetchOptions): Promise<{
  data: T | null;
  error: ApiError | null;
  rateLimited?: boolean;
  fromCache?: boolean;
  blocked?: boolean;
}> {
  const key = cacheKey || `${method}:${url}`;
  const requestKey = createRequestKey({ url, method });

  // 1. CHECK PERSISTENT CACHE
  if (method === 'GET' && !skipCache) {
    const cached = await persistentCache.get<T>(key);
    if (cached) {
      console.log(`[Persistent Cache] Hit: ${key}`);
      return { data: cached, error: null, fromCache: true };
    }
  }

  // 2. CHECK REFRESH COOLDOWN
  if (method === 'GET' && shouldBlockRequest(url)) {
    const stale = await persistentCache.get<T>(key);
    if (stale) {
      console.log(`[Block] Returning stale cache: ${key}`);
      return { data: stale, error: null, fromCache: true };
    }
    return {
      data: null,
      error: new ApiError('Please wait before refreshing', 429, 'REFRESH_COOLDOWN'),
      rateLimited: true,
      blocked: true,
    };
  }

  // 3. CHECK IDLE (client only)
  if (!isServer && isUserIdle && !skipIdleCheck && method === 'GET') {
    const stale = await persistentCache.get<T>(key);
    if (stale) {
      return { data: stale, error: null, fromCache: true };
    }
    return {
      data: null,
      error: new ApiError('User idle - refresh to reload', 503, 'USER_IDLE'),
      rateLimited: false,
    };
  }

  // 4. CHECK RATE LIMIT
  const rateCheck = rateLimiter.canProceed(rateLimitKey);
  if (!rateCheck.allowed) {
    const cached = await persistentCache.get<T>(key);
    if (cached) {
      return { data: cached, error: null, fromCache: true };
    }
    return {
      data: null,
      error: new ApiError(`Too many requests. Wait ${rateCheck.retryAfter}s`, 429, 'RATE_LIMITED'),
      rateLimited: true,
    };
  }

  // 5. WAIT FOR VISITOR TOKEN (client only)
  if (!isServer && requireAuth) {
    console.log(`[Fetch] Waiting for visitor before ${url}...`);
    const visitorStatus = await waitForVisitor();

    if (!visitorStatus.success) {
      console.log(`[Fetch] Visitor not ready:`, visitorStatus);
      if (visitorStatus.blocked) {
        return {
          data: null,
          error: new ApiError('Too many requests. Try again later.', 429, 'RATE_LIMITED'),
          rateLimited: true,
        };
      }
      return {
        data: null,
        error: new ApiError('Authentication failed. Please refresh.', 401, 'AUTH_FAILED'),
        rateLimited: false,
      };
    }
    console.log(`[Fetch] Visitor ready, proceeding with ${url}`);
  }

  // 6. EXECUTE REQUEST
  const doFetch = async () => {
    try {
      const response = await api.request({ url, method, data });

      if (method === 'GET') {
        await persistentCache.set(key, response.data);
      }

      if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
        const baseKey = url.split('/')[1];
        await persistentCache.invalidatePattern(baseKey);
      }

      return { data: response.data, error: null, fromCache: false };
    } catch (error: any) {
      const apiError = handleApiError(error);

      if (!error.response && method === 'GET') {
        const cached = await persistentCache.get<T>(key);
        if (cached) {
          return { data: cached, error: null, fromCache: true };
        }
      }

      return { data: null, error: apiError };
    }
  };

  // Apply debounce for GET requests
  if (method === 'GET' && !skipDebounce) {
    try {
      const result = await debounceRequest(requestKey, doFetch, 100);
      return { ...result, rateLimited: false, blocked: false };
    } catch (err: any) {
      if (err.message === 'Request cancelled') {
        return { data: null, error: null, rateLimited: false, blocked: false };
      }
      throw err;
    }
  }

  const result = await doFetch();
  return { ...result, rateLimited: false, blocked: false };
}
