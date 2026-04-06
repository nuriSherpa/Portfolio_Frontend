// src/lib/auth/cookies.ts

const IS_PROD = process.env.NODE_ENV === 'production';

const BASE = {
  secure: IS_PROD,
  sameSite: 'strict' as const,
  path: '/',
};

// ─── Obfuscated Cookie Names ─────────────────────────────────────────────────

// Was: admin_access_token → Random alphanumeric, looks like session ID
export const COOKIE_ACCESS_TOKEN = '_sess_id';

// Was: refreshToken → Looks like analytics/tracking ID
export const COOKIE_REFRESH_TOKEN = '_ga_track';

// Was: admin_user → Looks like cached preferences
export const COOKIE_USER = '_pref_cache';

// Was: userId (new) → Looks like CSRF token or nonce
export const COOKIE_USER_ID = '_csrf_nonce';

// ─── Set Options ──────────────────────────────────────────────────────────────

export const ACCESS_TOKEN_OPTIONS = { ...BASE, httpOnly: true, maxAge: 60 * 15 };
export const REFRESH_TOKEN_OPTIONS = { ...BASE, httpOnly: true, maxAge: 60 * 60 * 24 * 7 };
export const USER_COOKIE_OPTIONS = { ...BASE, httpOnly: false, maxAge: 60 * 60 * 24 * 7 };
export const USER_ID_OPTIONS = { ...BASE, httpOnly: true, maxAge: 60 * 60 * 24 * 7 };

// ─── Clear Options ────────────────────────────────────────────────────────────

export const CLEAR_OPTIONS = { ...BASE, httpOnly: true, maxAge: 0 };
export const CLEAR_USER_OPTIONS = { ...BASE, httpOnly: false, maxAge: 0 };
