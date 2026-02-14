// src/lib/api/actions/blog.ts
'use server';

import { createServerClient } from '../server';
import { ENDPOINTS } from '../endpoints';

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  publishedAt: string;
  tags?: string[];
}

export async function getBlogs() {
  try {
    const client = await createServerClient();
    const { data } = await client.get(ENDPOINTS.blogs);

    return {
      success: true,
      blogs: data.data as Blog[],
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      blogs: [] as Blog[],
      error: error.response?.data?.error?.message || 'Failed to load blogs',
    };
  }
}

export async function getBlogBySlug(slug: string) {
  try {
    const client = await createServerClient();
    const { data } = await client.get(ENDPOINTS.blogBySlug(slug));

    return {
      success: true,
      blog: data.data as Blog,
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      blog: null,
      error: error.response?.data?.error?.message || 'Failed to load blog',
    };
  }
}

export async function searchBlogs(query: string) {
  try {
    const client = await createServerClient();
    const { data } = await client.get(`${ENDPOINTS.blogSearch}?q=${query}`);

    return {
      success: true,
      blogs: data.data as Blog[],
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      blogs: [] as Blog[],
      error: error.response?.data?.error?.message || 'Search failed',
    };
  }
}
