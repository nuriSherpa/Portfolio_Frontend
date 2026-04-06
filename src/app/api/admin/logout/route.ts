// src/app/api/admin/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_USER,
  COOKIE_USER_ID,
} from '@/lib/auth/cookies';

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:9090/api/v1/admin';

export async function POST(request: NextRequest) {
  try {
    // Optional: Call backend logout
    await fetch(`${ADMIN_API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {
      /* ignore backend errors */
    });

    // Clear all cookies
    const response = NextResponse.json({ success: true });
    response.cookies.delete(COOKIE_ACCESS_TOKEN);
    response.cookies.delete(COOKIE_REFRESH_TOKEN);
    response.cookies.delete(COOKIE_USER);
    response.cookies.delete(COOKIE_USER_ID);

    return response;
  } catch (error) {
    console.error('[admin/logout]', error);
    return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 });
  }
}
