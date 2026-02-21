// src/lib/api/server-fetch.ts
'use server';

import { cookies } from 'next/headers';

interface FetchOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
}

export async function serverFetch<T>({
  url,
  method = 'GET',
  data,
  headers = {},
}: FetchOptions): Promise<{ data: T; error: null } | { data: null; error: string }> {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('visitor_token')?.value;

    // DEBUG: Log environment variables
    console.log('[serverFetch] Env check:', {
      API_URL: process.env.API_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    });

    // Build full URL - ensure no double slashes
    const baseUrl = process.env.API_URL || 'http://localhost:9090/api/v1';
    // Remove trailing slash from base and leading slash from url to prevent doubles
    const cleanBase = baseUrl.replace(/\/$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    const fullUrl = `${cleanBase}${cleanPath}`;

    console.log(`[serverFetch] ${method} ${fullUrl}`);

    const response = await fetch(fullUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Visitor-Token': token } : {}),
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      cache: 'no-store',
    });

    console.log(`[serverFetch] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[serverFetch] Error response: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return { data: result, error: null };
  } catch (error: any) {
    console.error('[serverFetch] Error:', error.message);
    return { data: null, error: error.message };
  }
}
