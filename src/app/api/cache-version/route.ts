// src/app/api/cache-version/route.ts
import { NextResponse } from 'next/server';

// Bump this number whenever you want clients to drop their IndexedDB cache
const CACHE_VERSION = 1;

export async function GET() {
  return NextResponse.json(
    { version: CACHE_VERSION },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
