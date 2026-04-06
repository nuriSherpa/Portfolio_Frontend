// src/lib/api/admin-core.ts
//
// Before every request:
//   1. Check the token expiry cookie client-side.
//   2. If expired (or within 30 s of expiry), call /api/admin/refresh FIRST.
//   3. Only then send the actual request.
//
// The backend should never see an expired token.

import { ensureValidToken } from '@/lib/auth/token-manager';

const SKIP_TOKEN_CHECK = new Set(['/login', '/register', '/refresh', '/check', '/logout']);

const IS_TUNNEL = process.env.NEXT_PUBLIC_IS_TUNNEL === 'true';
const TUNNEL_DOMAIN = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/$/, '');

const LOGIN_PATH = '/xk92-cms';

export interface CoreFetchOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  useProxy?: boolean;
}

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
}

function buildFullUrl(options: CoreFetchOptions): string {
  const prefix = options.useProxy ? '/api/proxy' : '/api/admin';
  if (typeof window !== 'undefined' && IS_TUNNEL) {
    return `${TUNNEL_DOMAIN}${prefix}${options.url}`;
  }
  return `${prefix}${options.url}`;
}

function redirectToLogin() {
  if (typeof window !== 'undefined') window.location.href = LOGIN_PATH;
}

// ── JSON fetch ────────────────────────────────────────────────────────────────

export async function coreFetch<T>(options: CoreFetchOptions): Promise<ApiResult<T>> {
  const fullUrl = buildFullUrl(options);

  // Step 1: Ensure the access token is valid BEFORE sending.
  // Skip for proxy (public) routes — they don't need auth.

  if (!options.useProxy && !SKIP_TOKEN_CHECK.has(options.url)) {
    const valid = await ensureValidToken();
    if (!valid) {
      console.warn('[coreFetch] Could not obtain valid token — redirecting to login');
      redirectToLogin();
      return { data: null, error: 'Session expired' };
    }
  }

  console.log(`[coreFetch] ${options.method ?? 'GET'} ${fullUrl}`);

  try {
    const res = await fetch(fullUrl, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      credentials: 'include',
    });

    console.log(`[coreFetch] Response: ${res.status}`);

    // 401 here means the backend rejected the token even though we thought it
    // was valid (clock skew, revoked session, etc.).  Try one refresh as a
    // last resort, then redirect to login.
    if (res.status === 401 && !options.useProxy) {
      console.warn('[coreFetchForm] 401 after refresh — session expired, redirecting');
      redirectToLogin();
      return { data: null, error: 'Session expired. Please log in again.' };
    }

    if (!res.ok) {
      return { data: null, error: await extractError(res) };
    }

    return { data: await res.json(), error: null };
  } catch (err) {
    console.error('[coreFetch] Network error:', err);
    return { data: null, error: err instanceof Error ? err.message : 'Network error' };
  }
}

// ── Multipart / FormData fetch ────────────────────────────────────────────────

export async function coreFetchForm<T>(
  options: Omit<CoreFetchOptions, 'body'> & { body: FormData },
): Promise<ApiResult<T>> {
  const fullUrl = buildFullUrl(options);

  if (!options.useProxy && !SKIP_TOKEN_CHECK.has(options.url)) {
    const valid = await ensureValidToken();
    if (!valid) {
      console.warn('[coreFetchForm] Could not obtain valid token — redirecting to login');
      redirectToLogin();
      return { data: null, error: 'Session expired' };
    }
  }

  console.log(`[coreFetchForm] ${options.method ?? 'POST'} ${fullUrl}`);

  try {
    const res = await fetch(fullUrl, {
      method: options.method ?? 'POST',
      body: options.body,
      credentials: 'include',
    });

    console.log(`[coreFetchForm] Response: ${res.status}`);

    // REPLACE the 401 block in coreFetch with:
    if (res.status === 401 && !options.useProxy) {
      console.warn('[coreFetch] 401 after refresh — session expired, redirecting');
      redirectToLogin();
      return { data: null, error: 'Session expired. Please log in again.' };
    }

    if (!res.ok) {
      return { data: null, error: await extractError(res) };
    }

    return { data: await res.json(), error: null };
  } catch (err) {
    console.error('[coreFetchForm] Network error:', err);
    return { data: null, error: err instanceof Error ? err.message : 'Network error' };
  }
}

async function extractError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return json.error?.message || json.message || json.error || `${res.status}: Request failed`;
  } catch {
    return text || `${res.status}: Request failed`;
  }
}

// ── Convenience methods ───────────────────────────────────────────────────────

export const adminCore = {
  get: <T>(url: string, useProxy = false) => coreFetch<T>({ url, method: 'GET', useProxy }),
  post: <T>(url: string, body: unknown, useProxy = false) =>
    coreFetch<T>({ url, method: 'POST', body, useProxy }),
  put: <T>(url: string, body: unknown, useProxy = false) =>
    coreFetch<T>({ url, method: 'PUT', body, useProxy }),
  patch: <T>(url: string, body: unknown, useProxy = false) =>
    coreFetch<T>({ url, method: 'PATCH', body, useProxy }),
  delete: <T>(url: string, useProxy = false) => coreFetch<T>({ url, method: 'DELETE', useProxy }),
  postForm: <T>(url: string, body: FormData, useProxy = false) =>
    coreFetchForm<T>({ url, method: 'POST', body, useProxy }),
  patchForm: <T>(url: string, body: FormData, useProxy = false) =>
    coreFetchForm<T>({ url, method: 'PATCH', body, useProxy }),
};
