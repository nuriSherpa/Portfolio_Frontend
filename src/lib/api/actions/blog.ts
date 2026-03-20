// src/lib/api/actions/blog.ts
'use server';

import { ENDPOINTS } from '@/lib/api/endpoints';

export interface AutocompleteSuggestion {
  type: 'post';
  id: string;
  title: string;
  slug: string;
  category?: string;
  tags: string[];
  views: number;
  excerpt?: string;
  rank: number;
}

export interface PostFilters {
  categories: Array<{ name: string; slug: string; count: number }>;
  tags: Array<{ name: string; count: number }>;
  sortOptions: string[];
}

export interface BaseMeta {
  total: number;
  page: number;
  totalPages: number;
  showing: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchMeta extends BaseMeta {
  query: string | null;
  activeTag: string | null;
  activeCategory: string | null;
  availableFilters: {
    categories: Array<{ name: string; slug: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
  };
}

export interface PostsResponse {
  posts: any[];
  meta: BaseMeta;
  filters: PostFilters;
}

export interface SearchResults {
  posts: any[];
  meta: SearchMeta;
  filters: PostFilters;
}

const BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:9090';

// =============== GET ALL POSTS (Simple listing) ===============
export async function getPosts(
  limit: number = 6,
  page: number = 1,
  tag?: string,
  sort: string = 'newest',
  category?: string,
): Promise<PostsResponse> {
  try {
    const params = new URLSearchParams();
    params.set('limit', limit.toString());
    params.set('page', page.toString());
    params.set('sort', sort);
    if (tag) params.set('tag', tag);
    if (category) params.set('category', category);

    const url = `${BASE_URL}/api/v1${ENDPOINTS.blogs}?${params.toString()}`;

    console.log('[getPosts] Fetching:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[getPosts] HTTP Error:', response.status);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const responseData = data.data || data;

    const posts = responseData.posts || responseData.results || [];

    return {
      posts,
      meta: responseData.meta || {
        total: responseData.totalResults || posts.length || 0,
        page: responseData.page || page,
        totalPages: responseData.totalPages || 1,
        showing: posts.length,
        hasNext: responseData.hasNext || false,
        hasPrev: responseData.hasPrev || false,
      },
      filters: responseData.filters ||
        responseData.availableFilters || {
          categories: [],
          tags: [],
          sortOptions: ['newest', 'popular'],
        },
    };
  } catch (error) {
    console.error('[getPosts] Error:', error);
    return {
      posts: [],
      meta: {
        total: 0,
        page,
        totalPages: 0,
        showing: 0,
        hasNext: false,
        hasPrev: false,
      },
      filters: { categories: [], tags: [], sortOptions: ['newest', 'popular'] },
    };
  }
}

// =============== AUTOCOMPLETE ===============
export async function getAutocompleteSuggestions(
  query: string,
  limit = 5,
): Promise<{
  success: boolean;
  suggestions: AutocompleteSuggestion[];
  total: number;
}> {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, suggestions: [], total: 0 };
    }

    const url = `${BASE_URL}/api/v1${ENDPOINTS.autocomplete}?q=${encodeURIComponent(query.trim())}&limit=${limit}`;

    console.log('[getAutocompleteSuggestions] Fetching:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    // Filter out invalid suggestions
    const validSuggestions = (data.data || data.suggestions || []).filter(
      (s: any) => s && typeof s === 'object' && typeof s.title === 'string' && s.title.length > 0,
    );

    return {
      success: data.success ?? true,
      suggestions: validSuggestions,
      total: data.total || validSuggestions.length,
    };
  } catch (error) {
    console.error('[getAutocompleteSuggestions] Error:', error);
    return { success: false, suggestions: [], total: 0 };
  }
}

// =============== FULL SEARCH (All filters) ===============
export async function searchPosts(
  query: string,
  options: {
    tag?: string;
    tags?: string[];
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
): Promise<SearchResults> {
  try {
    const params = new URLSearchParams();

    // Only add q if it exists and is meaningful
    if (query && query.trim().length >= 2) {
      params.set('q', query.trim());
    }

    params.set('limit', (options.limit || 6).toString());
    if (options.page) params.set('page', options.page.toString());
    if (options.tag) params.set('tag', options.tag);
    if (options.tags?.length) params.set('tags', options.tags.join(','));
    if (options.category) params.set('category', options.category);
    if (options.author) params.set('author', options.author);
    if (options.sort) params.set('sort', options.sort);
    if (options.fromDate) params.set('fromDate', options.fromDate);
    if (options.toDate) params.set('toDate', options.toDate);
    if (options.minReadingTime !== undefined)
      params.set('minReadingTime', options.minReadingTime.toString());
    if (options.maxReadingTime !== undefined)
      params.set('maxReadingTime', options.maxReadingTime.toString());

    const url = `${BASE_URL}/api/v1${ENDPOINTS.blogSearch}?${params.toString()}`;

    console.log('[searchPosts] Fetching:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const responseData = data.data || data;

    const posts = responseData.results || responseData.posts || [];
    const meta = responseData.meta || {};

    console.log('[searchPosts] Parsed:', {
      postsCount: posts.length,
      totalResults: meta.totalResults,
      totalPages: meta.totalPages,
      query: meta.searchTerm,
    });

    return {
      posts,
      meta: {
        total: meta.totalResults || posts.length || 0,
        page: meta.page || options.page || 1,
        totalPages: meta.totalPages || 1,
        showing: posts.length,
        hasNext: meta.hasNext || false,
        hasPrev: meta.hasPrev || false,
        query: meta.searchTerm || query || null,
        activeTag: options.tag || null,
        activeCategory: options.category || null,
        availableFilters: meta.availableFilters || {
          categories: [],
          tags: [],
        },
      },
      filters: {
        categories: meta.availableFilters?.categories || [],
        tags: meta.availableFilters?.tags || [],
        sortOptions: ['relevance', 'newest', 'popular', 'oldest'],
      },
    };
  } catch (error) {
    console.error('[searchPosts] Error:', error);
    return {
      posts: [],
      meta: {
        total: 0,
        page: options.page || 1,
        totalPages: 0,
        showing: 0,
        hasNext: false,
        hasPrev: false,
        query: query || null,
        activeTag: options.tag || null,
        activeCategory: options.category || null,
        availableFilters: { categories: [], tags: [] },
      },
      filters: {
        categories: [],
        tags: [],
        sortOptions: ['relevance', 'newest', 'popular', 'oldest'],
      },
    };
  }
}

// =============== GET POST BY SLUG ===============
export async function getPostBySlug(slug: string): Promise<any | null> {
  try {
    const url = `${BASE_URL}/api/v1${ENDPOINTS.blogBySlug(slug)}`;

    console.log('[getPostBySlug] Fetching:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('[getPostBySlug] Error:', error);
    return null;
  }
}

// Alias for backward compatibility
export const getBlogBySlug = getPostBySlug;
