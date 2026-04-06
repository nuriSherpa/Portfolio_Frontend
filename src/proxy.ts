// src/proxy.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from '@/lib/auth/cookies';

const LOGIN_PATH = '/xk92-cms';

// All CMS routes that require authentication.
// Uses startsWith — so /xk92-cms/blogs covers /blogs, /blogs/new, /blogs/[id]/edit etc.
const PROTECTED_ROUTES = [
  '/xk92-cms/dashboard',
  '/xk92-cms/blogs',
  '/xk92-cms/hero',
  '/xk92-cms/projects',
  '/xk92-cms/about',
  '/xk92-cms/settings',
  '/xk92-cms/posts',
];

// Exact public CMS routes (login page)
const PUBLIC_ROUTES = ['/xk92-cms', '/xk92-cms/'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Safety guard — never run middleware on API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isLoginPage = PUBLIC_ROUTES.includes(pathname);

  // Not a CMS route — skip all auth logic
  if (!isProtectedRoute && !isLoginPage) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(COOKIE_ACCESS_TOKEN)?.value ?? null;
  const refreshToken = request.cookies.get(COOKIE_REFRESH_TOKEN)?.value ?? null;

  const payload = accessToken ? await verifyAdminToken(accessToken) : null;
  const isAuthenticated = payload !== null;

  // ── Login page ─────────────────────────────────────────────────────────────
  if (isLoginPage) {
    // Already authenticated — send to dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/xk92-cms/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ── Protected routes ───────────────────────────────────────────────────────
  if (isProtectedRoute) {
    if (isAuthenticated) {
      return NextResponse.next();
    }

    if (refreshToken) {
      // Access token expired but refresh token present.
      // Allow through — the check route handles silent refresh.
      return NextResponse.next();
    }

    // No tokens — redirect to login
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
