// src/lib/api/server-fetch.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090';

interface FetchOptions {
  url: string;
  method?: 'GET' | 'POST';
  body?: any;
}

export async function serverFetch<T>({ url, method = 'GET', body }: FetchOptions): Promise<T> {
  // API_URL already includes /api/v1, so don't add it again
  const fullUrl = `${BASE_URL}${url}`;

  const res = await fetch(fullUrl, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    next: {
      revalidate: 3600,
      tags: [url],
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[serverFetch] Error: ${res.status} - ${errorText}`);
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}
