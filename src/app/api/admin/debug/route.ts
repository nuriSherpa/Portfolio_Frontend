// src/app/api/admin/debug/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const cookieInfo = allCookies.map((c) => ({
    name: c.name,
    value: c.value.substring(0, 30) + (c.value.length > 30 ? '...' : ''),
    length: c.value.length,
  }));

  console.log('=== DEBUG COOKIES ===');
  cookieInfo.forEach((c) => {
    console.log(`${c.name}: ${c.value}`);
  });
  console.log('====================');

  return NextResponse.json({
    cookies: cookieInfo,
    total: allCookies.length,
  });
}
