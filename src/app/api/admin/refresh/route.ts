// src/app/api/admin/refresh/route.ts
//
// The backend (Express) sets the refresh token as an httpOnly cookie and
// expects to READ it back as a cookie — NOT as a JSON body field.
// We forward it via the Cookie header.
import { decodeTokenPayload } from '@/lib/auth/jwt';
import { setExpCookie } from '@/lib/auth/set-exp-cookie';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_USER,
  COOKIE_USER_ID,
  ACCESS_TOKEN_OPTIONS,
  REFRESH_TOKEN_OPTIONS,
} from '@/lib/auth/cookies';

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:9090/api/v1/admin';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value;

    console.log('[admin/refresh] Refresh token exists:', !!refreshToken);

    if (!refreshToken) {
      console.log('[admin/refresh] No refresh token in cookie store');
      return NextResponse.json(
        { success: false, error: 'No refresh token provided' },
        { status: 401 },
      );
    }

    // The Express backend reads the refresh token from the Cookie header (httpOnly).
    // Forward it exactly as a cookie — do NOT put it in the body.
    const backendRes = await fetch(`${ADMIN_API_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward the refresh token cookie so Express can read req.cookies
        Cookie: `${COOKIE_REFRESH_TOKEN}=${refreshToken}`,
      },
    });

    console.log('[admin/refresh] Backend status:', backendRes.status);

    if (!backendRes.ok) {
      let errorData: { error?: { message?: string } | string } = {};
      try {
        errorData = await backendRes.json();
      } catch {
        /* ignore */
      }

      console.log('[admin/refresh] Backend refresh failed:', errorData);

      const response = NextResponse.json(
        {
          success: false,
          error:
            typeof errorData.error === 'object'
              ? errorData.error?.message
              : (errorData.error ?? 'Refresh failed'),
        },
        { status: backendRes.status },
      );

      // Clear all auth cookies on refresh failure — forces re-login
      response.cookies.delete(COOKIE_ACCESS_TOKEN);
      response.cookies.delete(COOKIE_REFRESH_TOKEN);
      response.cookies.delete(COOKIE_USER);
      response.cookies.delete(COOKIE_USER_ID);

      return response;
    }

    const data = await backendRes.json();
    console.log('[admin/refresh] Refresh successful');

    const accessToken = data.accessToken || data.access_token;
    const newRefreshToken = data.refreshToken || data.refresh_token;

    if (!accessToken) {
      console.error('[admin/refresh] Backend returned no accessToken');
      return NextResponse.json(
        { success: false, error: 'No access token returned' },
        { status: 500 },
      );
    }

    // Parse expiresIn into seconds
    let maxAge = 60 * 15; // default 15 minutes
    const expiresIn = data.expiresIn || data.expires_in;
    if (expiresIn) {
      if (typeof expiresIn === 'string') {
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (match) {
          const value = parseInt(match[1]);
          const unit = match[2];
          maxAge =
            unit === 's'
              ? value
              : unit === 'm'
                ? value * 60
                : unit === 'h'
                  ? value * 3600
                  : value * 86400;
        }
      } else if (typeof expiresIn === 'number') {
        maxAge = expiresIn;
      }
    }

    const response = NextResponse.json({
      success: true,
      accessToken,
      user: data.user,
      expiresIn: data.expiresIn || data.expires_in,
    });

    // Set new access token cookie (httpOnly, read by the proxy route)
    response.cookies.set({
      name: COOKIE_ACCESS_TOKEN,
      value: accessToken,
      ...ACCESS_TOKEN_OPTIONS,
      maxAge,
    });

    const decoded = decodeTokenPayload(accessToken);
    if (decoded?.exp) setExpCookie(response, decoded.exp);
    // Update refresh token if backend rotated it
    if (newRefreshToken && newRefreshToken !== refreshToken) {
      response.cookies.set({
        name: COOKIE_REFRESH_TOKEN,
        value: newRefreshToken,
        ...REFRESH_TOKEN_OPTIONS,
      });
      console.log('[admin/refresh] Refresh token rotated');
    }

    if (data.user) {
      response.cookies.set({
        name: COOKIE_USER,
        value: JSON.stringify(data.user),
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      response.cookies.set({
        name: COOKIE_USER_ID,
        value: data.user.id,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error) {
    console.error('[admin/refresh] Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
