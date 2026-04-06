// src/lib/api/actions/blog.ts
'use server';

import { cachedFetch } from '../cached-fetch';
import { BlogPost } from '@/lib/types/models';

const API_BASE = process.env.API_URL || 'http://localhost:9090/api/v1';

const ENDPOINTS = {
  blog: '/blog',
  blogSearch: '/blog/search',
  blogPost: (slug: string) => `/blog/${slug}`,
  blogAutocomplete: '/blog/search/autocomplete',
};

export interface BlogFilters {
  categories: Array<{ name: string; slug: string; count: number }>;
  tags: Array<{ name: string; count: number }>;
  sortOptions: string[];
}

export interface BlogMeta {
  total: number;
  page: number;
  totalPages: number;
  showing: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Keep /uploads/... paths as-is — Next.js rewrites proxy them to the backend.
// Strip any absolute localhost prefix so <Image> uses the same-origin proxy.
function fixImageUrl(url: string | undefined): string {
  if (!url) return '';
  // Already a relative /uploads/ path — use as-is
  if (url.startsWith('/uploads/')) return url;
  // Strip absolute localhost URL down to relative path
  const match = url.match(/\/uploads\/.+/);
  if (match) return match[0];
  // External URL — return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url;
}

function fixPost(post: any): BlogPost {
  if (!post) return post;
  return {
    ...post,
    featuredImage: fixImageUrl(post.featuredImage),
    coverImage: fixImageUrl(post.coverImage),
    firstImage: fixImageUrl(post.firstImage),
    author: post.author ? { ...post.author, avatar: fixImageUrl(post.author.avatar) } : post.author,
  };
}

// ── GET /api/v1/blog ──
// Response: { success, data: { posts, meta, filters } }
export async function getPosts(
  limit = 6,
  page = 1,
  tag?: string,
  sort = 'newest',
  category?: string,
) {
  try {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('page', String(page));
    if (tag) params.set('tag', tag);
    if (sort) params.set('sort', sort);
    if (category) params.set('category', category);

    const data = await cachedFetch<any>({
      url: `${ENDPOINTS.blog}?${params.toString()}`,
      key: `blog:list:${params.toString()}`,
      strategy: 'memory',
      ttl: 300,
      parser: (res: any) => {
        if (!res?.success) throw new Error(res?.message || 'API error');
        return res.data; // { posts, meta, filters }
      },
    });

    return {
      posts: (data.posts || []).map(fixPost) as BlogPost[],
      meta: {
        total: data.meta?.total || 0,
        page: data.meta?.page || page,
        totalPages: data.meta?.totalPages || 1,
        showing: data.meta?.showing || 0,
        hasNext: data.meta?.hasNext || false,
        hasPrev: data.meta?.hasPrev || false,
      } as BlogMeta,
      filters: {
        categories: data.filters?.categories || [],
        tags: data.filters?.tags || [],
        sortOptions: data.filters?.sortOptions || ['newest', 'oldest', 'popular', 'a-z', 'z-a'],
      } as BlogFilters,
    };
  } catch (e: any) {
    console.error('[getPosts] Error:', e.message);
    return {
      posts: [] as BlogPost[],
      meta: {
        total: 0,
        page,
        totalPages: 1,
        showing: 0,
        hasNext: false,
        hasPrev: false,
      } as BlogMeta,
      filters: {
        categories: [],
        tags: [],
        sortOptions: ['newest', 'oldest', 'popular'],
      } as BlogFilters,
    };
  }
}

// ── GET /api/v1/blog/search ──
// Response: { success, data: { results, meta } }
export async function searchPosts(
  query = '',
  options: {
    tag?: string;
    tags?: string;
    category?: string;
    author?: string;
    sort?: string;
    page?: number;
    limit?: number;
    fromDate?: string;
    toDate?: string;
    minReadingTime?: number;
    maxReadingTime?: number;
  } = {},
) {
  try {
    const params = new URLSearchParams();
    params.set('limit', String(options.limit || 6));
    params.set('page', String(options.page || 1));
    if (query) params.set('q', query);
    if (options.tag) params.set('tag', options.tag);
    if (options.tags) params.set('tags', options.tags);
    if (options.category) params.set('category', options.category);
    if (options.author) params.set('author', options.author);
    if (options.sort) params.set('sort', options.sort);
    if (options.fromDate) params.set('fromDate', options.fromDate);
    if (options.toDate) params.set('toDate', options.toDate);
    if (options.minReadingTime) params.set('minReadingTime', String(options.minReadingTime));
    if (options.maxReadingTime) params.set('maxReadingTime', String(options.maxReadingTime));

    const data = await cachedFetch<any>({
      url: `${ENDPOINTS.blogSearch}?${params.toString()}`,
      key: `blog:search:${params.toString()}`,
      strategy: 'memory',
      ttl: 60,
      parser: (res: any) => {
        if (!res?.success) throw new Error(res?.message || 'API error');
        return res.data; // { results, meta }
      },
    });

    const posts = (data.results || []).map(fixPost) as BlogPost[];
    const meta = data.meta || {};

    return {
      posts,
      meta: {
        total: meta.totalResults || posts.length,
        page: meta.page || options.page || 1,
        totalPages: meta.totalPages || 1,
        showing: posts.length,
        hasNext: meta.hasNext || false,
        hasPrev: meta.hasPrev || false,
      } as BlogMeta,
      filters: null,
    };
  } catch (e: any) {
    console.error('[searchPosts] Error:', e.message);
    return {
      posts: [] as BlogPost[],
      meta: {
        total: 0,
        page: options.page || 1,
        totalPages: 1,
        showing: 0,
        hasNext: false,
        hasPrev: false,
      } as BlogMeta,
      filters: null,
    };
  }
}

// ── GET /api/v1/blog/search/autocomplete ──
// Response: { success, data: [...], meta: { totalResults } }
export async function getAutocompleteSuggestions(query: string, limit = 5) {
  try {
    const url = `${API_BASE}${ENDPOINTS.blogAutocomplete}?q=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json?.success) throw new Error(json?.message || 'API error');
    const suggestions = Array.isArray(json.data) ? json.data : [];
    return { suggestions, total: json.meta?.totalResults || suggestions.length };
  } catch (e: any) {
    console.error('[getAutocompleteSuggestions] Error:', e.message);
    return { suggestions: [], total: 0 };
  }
}

// ── GET /api/v1/blog/:slug ──
// Response: { success, data: BlogPost }
export async function getPostBySlug(slug: string) {
  try {
    const post = await cachedFetch<BlogPost>({
      url: ENDPOINTS.blogPost(slug),
      key: `blog:post:${slug}`,
      strategy: 'memory',
      ttl: 3600,
      parser: (res: any) => {
        if (!res?.success) throw new Error(res?.message || 'API error');
        return fixPost(res.data) as BlogPost;
      },
    });
    return post;
  } catch (e: any) {
    console.error('[getPostBySlug] Error:', e.message);
    return null;
  }
}
