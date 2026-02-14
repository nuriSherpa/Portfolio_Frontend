// src/lib/api/server.ts
import axios from 'axios';
import { cookies } from 'next/headers';

export async function createServerClient() {
  const cookieStore = await cookies(); // ← Add await
  const token = cookieStore.get('visitor_token')?.value;

  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-Visitor-Token': token } : {}),
    },
  });
}
