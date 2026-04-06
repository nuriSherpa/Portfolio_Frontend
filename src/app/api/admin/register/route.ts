import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_USER,
  ACCESS_TOKEN_OPTIONS,
  USER_COOKIE_OPTIONS,
} from '@/lib/auth/cookies';
import { forwardSetCookieHeaders } from '@/lib/auth/forward-cookies';

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${ADMIN_API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { success: false, error: data.error?.message || 'Registration failed' },
        { status: backendRes.status },
      );
    }

    const response = NextResponse.json({
      success: true,
      user: data.user,
    });

    forwardSetCookieHeaders(backendRes, response);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_ACCESS_TOKEN, data.accessToken, ACCESS_TOKEN_OPTIONS);
    cookieStore.set(COOKIE_USER, JSON.stringify(data.user), USER_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error('[admin/register]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
