// src/lib/api/fetcher.ts
import axios, { AxiosError } from 'axios';
import { handleApiError, ApiError } from '../utils/api-error';
import { rateLimiter } from '../utils/rate-limiter';
import { persistentCache } from '../utils/persistent-cache';
import { createRequestKey, shouldBlockRequest, debounceRequest } from '../utils/request-manager';

let isUserIdle = false;
export function setUserIdle(idle: boolean) {
  isUserIdle = idle;
}

const DEBOUNCE_MS = 300;

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
  isServer?: boolean;
}

interface FetchResult<T> {
  data: T | null;
  error: ApiError | null;
  rateLimited?: boolean;
  fromCache?: boolean;
  blocked?: boolean;
}

// SERVER-SIDE: Direct fetch with no abstraction
async function serverFetch<T>(url: string, method: string, body?: any): Promise<FetchResult<T>> {
  // Use API_URL for server, fallback to NEXT_PUBLIC_API_URL
  const baseURL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!baseURL) {
    console.error('[ServerFetch] ERROR: API_URL is not defined!');
    return {
      data: null,
      error: new ApiError('API_URL environment variable is missing', 500, 'CONFIG_ERROR'),
    };
  }

  const fullUrl = `${baseURL}${url}`;
  console.log(`[ServerFetch] ${method} ${fullUrl}`);

  try {
    const res = await fetch(fullUrl, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });

    // Get response as text first to check if it's HTML
    const text = await res.text();

    // Check if response is HTML (starts with <)
    if (text.trim().startsWith('<')) {
      console.error(`[ServerFetch] Received HTML instead of JSON from ${fullUrl}`);
      console.error('[ServerFetch] HTML snippet:', text.slice(0, 200));
      return {
        data: null,
        error: new ApiError(
          `Backend returned HTML. Check if API is running at ${baseURL}`,
          502,
          'HTML_RESPONSE',
        ),
      };
    }

    // Parse JSON
    let data: T;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return {
        data: null,
        error: new ApiError('Invalid JSON response from server', 500, 'PARSE_ERROR'),
      };
    }

    // Check HTTP status
    if (!res.ok) {
      const message = (data as any)?.error?.message || `HTTP ${res.status}`;
      return {
        data: null,
        error: new ApiError(message, res.status, (data as any)?.error?.code),
      };
    }

    return { data, error: null, fromCache: false };
  } catch (err: any) {
    console.error(`[ServerFetch] Network error:`, err.message);
    return {
      data: null,
      error: new ApiError(
        `Cannot connect to ${baseURL}. Is the backend running?`,
        503,
        'NETWORK_ERROR',
      ),
    };
  }
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
  isServer = false,
}: FetchOptions): Promise<FetchResult<T>> {
  // SERVER-SIDE: Use simple fetch
  if (isServer) {
    return serverFetch<T>(url, method, data);
  }

  // CLIENT-SIDE: Use existing axios logic with caching
  const key = cacheKey || `${method}:${url}`;
  const requestKey = createRequestKey({ url, method });

  // 1. CHECK CACHE
  if (method === 'GET' && !skipCache) {
    const cached = await persistentCache.get<T>(key);
    if (cached) {
      console.log(`[Cache] Hit: ${key}`);
      return { data: cached, error: null, fromCache: true };
    }
  }

  // 2. CHECK REFRESH COOLDOWN
  if (method === 'GET' && shouldBlockRequest(url, isServer)) {
    const stale = await persistentCache.get<T>(key);
    if (stale) {
      return { data: stale, error: null, fromCache: true };
    }
    return {
      data: null,
      error: new ApiError('Please wait before refreshing', 429, 'REFRESH_COOLDOWN'),
      rateLimited: true,
      blocked: true,
    };
  }

  // 3. CHECK IDLE
  if (isUserIdle && !skipIdleCheck && method === 'GET') {
    const stale = await persistentCache.get<T>(key);
    if (stale) {
      return { data: stale, error: null, fromCache: true };
    }
    return {
      data: null,
      error: new ApiError('User idle - refresh to reload', 503, 'USER_IDLE'),
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

  // 5. EXECUTE (Axios)
  const doFetch = async (): Promise<FetchResult<T>> => {
    try {
      const response = await axios.request({ url, method, data });

      if (method === 'GET' && !skipCache) {
        await persistentCache.set(key, response.data);
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

  if (skipDebounce) {
    return doFetch();
  }

  try {
    return await debounceRequest(requestKey, doFetch, DEBOUNCE_MS);
  } catch (err: any) {
    if (err.message === 'Request cancelled') {
      return { data: null, error: null };
    }
    throw err;
  }
}
