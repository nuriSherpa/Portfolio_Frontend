import { cachedFetch, invalidateCache } from '../cached-fetch';
import { BlogPost } from '@/lib/types/models';
import { ENDPOINTS } from '../endpoints';

interface PostsApiResponse {
  success: boolean;
  message?: string;
  data: {
    posts: BlogPost[];
    meta: {
      total: number;
      page: number;
      totalPages: number;
      showing: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: {
      categories: Array<{ name: string; slug: string; count: number }>;
      tags: Array<{ name: string; count: number }>;
      sortOptions: string[];
    };
  };
  timestamp?: string;
}

interface PostApiResponse {
  success: boolean;
  message?: string;
  data: BlogPost;
  timestamp?: string;
}

const POSTS_CACHE_KEY = 'posts:list';
const POSTS_CACHE_TTL = 300; // 5 minutes
const POST_DETAIL_CACHE_TTL = 3600; // 1 hour

export async function getPosts(limit = 6, page = 1, tag?: string, search?: string) {
  try {
    let url = `${ENDPOINTS.blogs}?limit=${limit}&page=${page}`;
    if (tag) url += `&tag=${encodeURIComponent(tag)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const result = await cachedFetch<PostsApiResponse['data']>({
      url,
      key: `posts:list:page:${page}:limit:${limit}:tag:${tag || 'all'}:search:${search || 'none'}`,
      strategy: 'memory',
      ttl: POSTS_CACHE_TTL,
      parser: (res: PostsApiResponse) => {
        if (!res?.success) {
          throw new Error(res?.message || 'API returned unsuccessful response');
        }
        if (!res?.data) {
          throw new Error('No posts data received');
        }
        return res.data;
      },
    });

    return {
      posts: result.posts || [],
      meta: result.meta || {
        total: 0,
        page: 1,
        totalPages: 1,
        showing: 0,
        hasNext: false,
        hasPrev: false,
      },
      filters: result.filters || {
        categories: [],
        tags: [],
        sortOptions: ['newest', 'oldest', 'popular', 'a-z', 'z-a'],
      },
    };
  } catch (error: any) {
    console.error('[getPosts] Error:', error.message);
    return {
      posts: [] as BlogPost[],
      meta: {
        total: 0,
        page: 1,
        totalPages: 1,
        showing: 0,
        hasNext: false,
        hasPrev: false,
      },
      filters: {
        categories: [],
        tags: [],
        sortOptions: ['newest', 'oldest', 'popular', 'a-z', 'z-a'],
      },
    };
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const post = await cachedFetch<BlogPost>({
      url: ENDPOINTS.blogBySlug(slug),
      key: `posts:slug:${slug}`,
      strategy: 'memory',
      ttl: POST_DETAIL_CACHE_TTL,
      parser: (result: PostApiResponse) => {
        if (!result?.success) {
          throw new Error(result?.message || 'API returned unsuccessful response');
        }
        if (!result?.data) {
          throw new Error('No post data received');
        }
        return result.data;
      },
    });

    return post;
  } catch (error: any) {
    console.error('[getPostBySlug] Error:', error.message);
    return null;
  }
}

export async function getPostsFresh(limit = 6, page = 1, tag?: string, search?: string) {
  try {
    let url = `${ENDPOINTS.blogs}?limit=${limit}&page=${page}`;
    if (tag) url += `&tag=${encodeURIComponent(tag)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const result = await cachedFetch<PostsApiResponse['data']>({
      url,
      key: `${POSTS_CACHE_KEY}:fresh:page:${page}`,
      strategy: 'no-cache',
      parser: (result) => {
        if (!result?.success) throw new Error('API returned unsuccessful');
        return result.data;
      },
    });

    return {
      posts: result.posts || [],
      meta: result.meta || {
        total: 0,
        page: 1,
        totalPages: 1,
        showing: 0,
        hasNext: false,
        hasPrev: false,
      },
      filters: result.filters || {
        categories: [],
        tags: [],
        sortOptions: ['newest', 'oldest', 'popular', 'a-z', 'z-a'],
      },
    };
  } catch (error: any) {
    console.error('[getPostsFresh] Error:', error.message);
    return {
      posts: [] as BlogPost[],
      meta: {
        total: 0,
        page: 1,
        totalPages: 1,
        showing: 0,
        hasNext: false,
        hasPrev: false,
      },
      filters: {
        categories: [],
        tags: [],
        sortOptions: ['newest', 'oldest', 'popular', 'a-z', 'z-a'],
      },
    };
  }
}

export function invalidatePostsCache(page?: number) {
  if (page) {
    invalidateCache(`posts:list:page:${page}`);
  } else {
    invalidateCache('posts:list');
  }
}

export function invalidatePostCache(slug: string) {
  invalidateCache(`posts:slug:${slug}`);
}
