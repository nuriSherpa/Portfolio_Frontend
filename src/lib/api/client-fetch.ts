// src/lib/api/client-fetch.ts
import { ENDPOINTS } from './endpoints';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetchOptions<B = unknown> {
  method?: Method;
  body?: B;
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Environment detection - FIX: trim and remove trailing slash
const IS_TUNNEL = process.env.NEXT_PUBLIC_IS_TUNNEL === 'true';
const TUNNEL_DOMAIN = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tendinurisherpa.com.np')
  .trim()
  .replace(/\/$/, '');

export const clientFetch = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const { method = 'GET', body, headers = {} } = options;

  // Detect if this is a Next.js internal API call (starts with /api/ but not /api/v1/)
  const isNextJsApi = endpoint.startsWith('/api/') && !endpoint.startsWith('/api/v1/');

  // Build the correct base URL based on environment and API type
  let baseUrl: string;

  if (typeof window === 'undefined') {
    // Server-side
    if (isNextJsApi) {
      // Next.js API routes: use relative URL (same origin)
      baseUrl = '';
    } else {
      // Backend API: direct to localhost
      baseUrl = process.env.API_URL || 'http://localhost:9090/api/v1';
    }
  } else {
    // Browser-side
    if (IS_TUNNEL) {
      // In tunnel mode: use absolute URL for both types
      baseUrl = isNextJsApi ? TUNNEL_DOMAIN : `${TUNNEL_DOMAIN}/api/v1`;
    } else {
      // Local mode: relative URL
      baseUrl = isNextJsApi ? '' : process.env.NEXT_PUBLIC_API_URL || '/api/v1';
    }
  }

  const fullUrl = `${baseUrl}${endpoint}`;
  console.log(
    `[clientFetch] ${method} ${fullUrl} (${typeof window !== 'undefined' ? 'browser' : 'server'}, tunnel=${IS_TUNNEL}, type=${isNextJsApi ? 'nextjs' : 'backend'})`,
  );

  try {
    const res = await fetch(fullUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: 'include',
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Request failed: ${res.status} - ${text}`);
    }

    // Next.js API routes don't wrap in {success, data} format
    if (isNextJsApi) {
      return res.json();
    }

    const json: ApiResponse<T> = await res.json();

    if (!json.success) {
      throw new Error(json.message || 'Request failed');
    }

    return json.data;
  } catch (error) {
    console.error('[clientFetch] Error:', error);
    throw error;
  }
};

export const get = <T>(endpoint: string, headers?: Record<string, string>) =>
  clientFetch<T>(endpoint, { method: 'GET', headers });

export const post = <T, B = unknown>(
  endpoint: string,
  body?: B,
  headers?: Record<string, string>,
) => clientFetch<T>(endpoint, { method: 'POST', body, headers });

export const put = <T, B = unknown>(endpoint: string, body?: B, headers?: Record<string, string>) =>
  clientFetch<T>(endpoint, { method: 'PUT', body, headers });

export const patch = <T, B = unknown>(
  endpoint: string,
  body?: B,
  headers?: Record<string, string>,
) => clientFetch<T>(endpoint, { method: 'PATCH', body, headers });

export const del = <T>(endpoint: string, headers?: Record<string, string>) =>
  clientFetch<T>(endpoint, { method: 'DELETE', headers });

export { ENDPOINTS };
