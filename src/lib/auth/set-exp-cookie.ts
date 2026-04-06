// src/lib/auth/set-exp-cookie.ts
import { NextResponse } from 'next/server';

const IS_PROD = process.env.NODE_ENV === 'production';

export function setExpCookie(response: NextResponse, expTimestamp: number): void {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const maxAge = Math.max(0, expTimestamp - nowSeconds);

  response.cookies.set({
    name: '_sess_exp',
    value: String(expTimestamp),
    httpOnly: false, // MUST be false — browser JS needs to read this
    secure: IS_PROD,
    sameSite: 'strict',
    path: '/',
    maxAge,
  });
}
