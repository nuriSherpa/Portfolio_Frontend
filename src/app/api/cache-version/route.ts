// app/api/cache-version/route.ts
import { NextResponse } from 'next/server';
import { getCacheVersion } from '../revalidate/route';

export async function GET() {
  const version = getCacheVersion();

  return NextResponse.json({
    version,
    timestamp: new Date().toISOString(),
  });
}
