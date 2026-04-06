// src/lib/auth/forward-cookies.ts

import { NextResponse } from 'next/server';

/**
 * Forwards Set-Cookie headers from Express response to Next.js response.
 * This is how the httpOnly refreshToken set by Express reaches the browser.
 */
export function forwardSetCookieHeaders(
  backendResponse: Response,
  nextResponse: NextResponse,
): void {
  // Get all Set-Cookie headers
  let cookies: string[] = [];

  // Try getSetCookie first (modern browsers)
  if (typeof (backendResponse.headers as any).getSetCookie === 'function') {
    cookies = (backendResponse.headers as any).getSetCookie();
    console.log('[forwardSetCookieHeaders] Using getSetCookie, found:', cookies.length);
  } else {
    // Fallback for older environments
    const raw = backendResponse.headers.get('set-cookie');
    if (raw) {
      cookies = [raw];
      console.log('[forwardSetCookieHeaders] Using raw set-cookie header');
    }
  }

  if (cookies.length === 0) {
    console.log('[forwardSetCookieHeaders] No cookies to forward');
    return;
  }

  // Forward each cookie
  for (const cookie of cookies) {
    console.log('[forwardSetCookieHeaders] Forwarding cookie:', cookie.substring(0, 100));

    // Extract cookie name and value
    const nameValueMatch = cookie.match(/^([^=]+)=([^;]+)/);
    if (nameValueMatch) {
      const name = nameValueMatch[1];
      const value = nameValueMatch[2];

      // Parse options
      const options: {
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: 'lax' | 'strict' | 'none';
        path?: string;
        maxAge?: number;
      } = {};

      if (cookie.includes('HttpOnly')) options.httpOnly = true;
      if (cookie.includes('Secure')) options.secure = true;
      if (cookie.includes('SameSite=Lax')) options.sameSite = 'lax';
      if (cookie.includes('SameSite=Strict')) options.sameSite = 'strict';
      if (cookie.includes('SameSite=None')) options.sameSite = 'none';

      const pathMatch = cookie.match(/Path=([^;]+)/);
      if (pathMatch) options.path = pathMatch[1];

      const maxAgeMatch = cookie.match(/Max-Age=([^;]+)/);
      if (maxAgeMatch) options.maxAge = parseInt(maxAgeMatch[1]);

      // Set the cookie using Next.js API
      nextResponse.cookies.set(name, value, options);
    } else {
      // Fallback: just append the header
      nextResponse.headers.append('Set-Cookie', cookie);
    }
  }
}
