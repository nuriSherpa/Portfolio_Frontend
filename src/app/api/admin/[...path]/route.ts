// src/app/api/admin/[...path]/route.ts
//
// CRITICAL: This catch-all must NEVER match the locally-handled auth routes:
//   check | login | logout | refresh | register
// Those have their own route.ts files. If this handler intercepts them it
// creates an infinite redirect loop (ERR_TOO_MANY_REDIRECTS).

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_ACCESS_TOKEN } from '@/lib/auth/cookies';

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:9090/api/v1/admin';

// Routes handled by their own Next.js route.ts files — never proxy these.
const LOCAL_AUTH_ROUTES = new Set(['check', 'login', 'logout', 'refresh', 'register']);

async function proxyToBackend(request: NextRequest, pathSegments: string[]) {
  // Guard: if the first segment is a locally-handled auth route, return 404
  // so Next.js falls through to the correct file-based handler.
  // (In practice Next.js file-based routing wins, but this is a safety net.)
  if (pathSegments.length > 0 && LOCAL_AUTH_ROUTES.has(pathSegments[0])) {
    console.warn(`[Admin API Proxy] Blocked local auth route: ${pathSegments[0]}`);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const path = pathSegments.join('/');
    const searchParams = request.nextUrl.search;
    const targetUrl = `${ADMIN_API_URL}/${path}${searchParams}`;

    console.log(`[Admin API Proxy] ${request.method} ${targetUrl}`);

    const cookieStore = await cookies();
    const accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

    console.log(
      `[Admin API Proxy] Access token: ${accessToken ? `✓ present (${accessToken.substring(0, 30)}...)` : '✗ missing'}`,
    );

    const headers = new Headers();

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
      console.log(`[Admin API Proxy] Added Authorization header`);
    } else {
      console.warn(`[Admin API Proxy] WARNING: No access token — request will likely 401`);
    }

    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    let body: BodyInit | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      if (contentType?.includes('multipart/form-data')) {
        body = await request.formData();
        headers.delete('Content-Type'); // Let fetch set the boundary automatically
      } else {
        body = await request.blob();
      }
    }

    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      credentials: 'include',
    });

    console.log(`[Admin API Proxy] Backend response: ${backendResponse.status}`);

    const text = await backendResponse.text();
    console.log('[proxy] Response body (first 100):', text.substring(0, 100));

    const response = new NextResponse(text, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response;
  } catch (error) {
    console.error('[Admin API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Backend request failed', details: String(error) },
      { status: 502 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}
