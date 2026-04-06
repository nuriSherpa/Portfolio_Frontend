// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { decodeTokenPayload } from '@/lib/auth/jwt';
import { setExpCookie } from '@/lib/auth/set-exp-cookie';
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_USER,
  COOKIE_USER_ID,
  ACCESS_TOKEN_OPTIONS,
  USER_COOKIE_OPTIONS,
  USER_ID_OPTIONS,
} from '@/lib/auth/cookies';
import { forwardSetCookieHeaders } from '@/lib/auth/forward-cookies';

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:9090/api/v1/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[admin/login] Login attempt for:', body.email);

    const backendRes = await fetch(`${ADMIN_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // ADD THESE LOGS TEMPORARILY
    const setCookies = (backendRes.headers as any).getSetCookie?.() ?? [];
    console.log('[login] Backend status:', backendRes.status);
    console.log('[login] Backend set-cookie headers:', setCookies);
    console.log('[login] Raw set-cookie:', backendRes.headers.get('set-cookie'));

    const data = await backendRes.json();
    console.log('[admin/login] Backend response status:', backendRes.status);

    if (!backendRes.ok) {
      return NextResponse.json(
        { success: false, error: data.error?.message || 'Login failed' },
        { status: backendRes.status },
      );
    }

    const response = NextResponse.json({
      success: true,
      user: data.user,
    });

    // Forward refreshToken from Express (sets httpOnly cookie)
    forwardSetCookieHeaders(backendRes, response);

    // Set access token (short-lived)
    response.cookies.set(COOKIE_ACCESS_TOKEN, data.accessToken, {
      ...ACCESS_TOKEN_OPTIONS,
      maxAge: 60, // 1 minute for testing
    });

    // Set user cookies
    response.cookies.set(COOKIE_USER, JSON.stringify(data.user), USER_COOKIE_OPTIONS);
    response.cookies.set(COOKIE_USER_ID, data.user.id, USER_ID_OPTIONS);

    const decoded = decodeTokenPayload(data.accessToken);
    if (decoded?.exp) setExpCookie(response, decoded.exp);

    return response;
  } catch (error) {
    console.error('[admin/login]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
