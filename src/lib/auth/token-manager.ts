// src/lib/auth/token-manager.ts
//
// Client-side token expiry guard.
//
// Why not use verifyAdminToken() here?
//   verifyAdminToken() lives in jwt.ts and works great — but it needs the
//   actual token string.  The access token (_sess_id) is httpOnly, so
//   browser JS cannot read it.  Instead, the login and refresh routes write
//   the token's `exp` timestamp into a non-httpOnly cookie (_sess_exp).
//   This file reads that timestamp to decide whether to refresh proactively,
//   without ever touching the real token.
//
// verifyAdminToken() continues to be used server-side in:
//   - /api/admin/check/route.ts   (session check on dashboard load)
//   - middleware (proxy.ts)        (page-level route protection)
//
// This file handles the client-side pre-request guard only.

const IS_TUNNEL = process.env.NEXT_PUBLIC_IS_TUNNEL === 'true';
const TUNNEL_DOMAIN = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/$/, '');

// Refresh this many seconds before actual expiry to avoid mid-flight expiry
const EXPIRY_BUFFER_SECONDS = 30;

// Non-httpOnly cookie — stores the access token's exp as a Unix timestamp.
// Written by login/route.ts and refresh/route.ts (see set-exp-cookie.ts).
const EXP_COOKIE = '_sess_exp';

// ── Read expiry cookie ────────────────────────────────────────────────────────

function getStoredExp(): number | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${EXP_COOKIE}=([^;]+)`));
  return match ? parseInt(match[1], 10) : null;
}

export function isTokenExpiredOrMissing(): boolean {
  const exp = getStoredExp();
  if (!exp) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return nowSeconds >= exp - EXPIRY_BUFFER_SECONDS;
}

// ── Refresh ───────────────────────────────────────────────────────────────────

let refreshPromise: Promise<boolean> | null = null;

function doRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  const base = IS_TUNNEL ? TUNNEL_DOMAIN : '';

  refreshPromise = fetch(`${base}/api/admin/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then((res) => {
      console.log('[token-manager] Refresh response:', res.status);
      return res.ok;
    })
    .catch((err) => {
      console.error('[token-manager] Refresh network error:', err);
      return false;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/**
 * Call BEFORE every authenticated request.
 * - Token still valid → returns true immediately (no network call).
 * - Token expired/missing → refreshes first, then returns result.
 */
export async function ensureValidToken(): Promise<boolean> {
  if (!isTokenExpiredOrMissing()) return true;
  console.log('[token-manager] Token expired or missing — proactive refresh');
  return doRefresh();
}

/**
 * Call when the backend returns an unexpected 401 despite a valid-looking
 * token (clock skew, revoked session, etc.).
 */
export async function emergencyRefresh(): Promise<boolean> {
  console.log('[token-manager] Emergency refresh (unexpected backend 401)');
  return doRefresh();
}
