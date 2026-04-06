// src/app/api/admin/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_USER,
  COOKIE_USER_ID,
  ACCESS_TOKEN_OPTIONS,
} from '@/lib/auth/cookies';
import { verifyAdminToken } from '@/lib/auth/jwt';
import { forwardSetCookieHeaders } from '@/lib/auth/forward-cookies';

// Environment detection
const IS_TUNNEL = process.env.NEXT_PUBLIC_IS_TUNNEL === 'true';
const IS_PROD = process.env.NODE_ENV === 'production';

// Server-side API URL logic:
// - Tunnel mode: Next.js runs on Mac, reached via nginx. Backend is also on Mac.
//   Use localhost:9090 (both Next.js and backend are on same Mac host)
// - Production: Use configured API_URL or default
// - Local dev: Use localhost:9090
const ADMIN_API_URL = IS_PROD
  ? process.env.ADMIN_API_URL || 'http://localhost:9090/api/v1/admin'
  : IS_TUNNEL
    ? 'http://localhost:9090/api/v1/admin' // Both Next.js and backend on Mac
    : process.env.ADMIN_API_URL || 'http://localhost:9090/api/v1/admin';

console.log(
  `[admin/check] Environment: IS_TUNNEL=${IS_TUNNEL}, IS_PROD=${IS_PROD}, ADMIN_API_URL=${ADMIN_API_URL}`,
);

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
    const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value;
    const userCookie = cookieStore.get(COOKIE_USER)?.value;
    const userId = cookieStore.get(COOKIE_USER_ID)?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    if (accessToken) {
      const payload = await verifyAdminToken(accessToken);
      if (payload) {
        let user = null;
        try {
          user = userCookie ? JSON.parse(userCookie) : null;
        } catch {
          /* ignore */
        }
        return NextResponse.json({
          authenticated: true,
          user: { ...user, id: userId || user?.id },
          exp: payload.exp,
        });
      }
    }

    if (!refreshToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Call backend refresh
    const refreshUrl = `${ADMIN_API_URL}/refresh`;
    console.log(`[admin/check] Calling backend refresh at: ${refreshUrl}`);

    const refreshRes = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${COOKIE_REFRESH_TOKEN}=${refreshToken}`,
      },
    });

    const refreshData = await refreshRes.json();

    if (!refreshRes.ok) {
      const response = NextResponse.json({ authenticated: false }, { status: 401 });
      response.cookies.delete(COOKIE_ACCESS_TOKEN);
      response.cookies.delete(COOKIE_REFRESH_TOKEN);
      response.cookies.delete(COOKIE_USER);
      response.cookies.delete(COOKIE_USER_ID);
      return response;
    }

    const response = NextResponse.json({
      authenticated: true,
      user: refreshData.user,
      exp: refreshData.expiresIn,
      refreshed: true,
    });

    forwardSetCookieHeaders(refreshRes, response);

    // Parse expiresIn
    let maxAge = 60;
    if (typeof refreshData.expiresIn === 'string') {
      const match = refreshData.expiresIn.match(/^(\d+)([mhd])$/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        maxAge = unit === 'm' ? value * 60 : unit === 'h' ? value * 3600 : value * 86400;
      }
    } else if (typeof refreshData.expiresIn === 'number') {
      maxAge = refreshData.expiresIn;
    }

    response.cookies.set(COOKIE_ACCESS_TOKEN, refreshData.accessToken, {
      ...ACCESS_TOKEN_OPTIONS,
      maxAge,
    });

    if (refreshData.user) {
      response.cookies.set(COOKIE_USER, JSON.stringify(refreshData.user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      response.cookies.set(COOKIE_USER_ID, refreshData.user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error) {
    console.error('[admin/check] Error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
