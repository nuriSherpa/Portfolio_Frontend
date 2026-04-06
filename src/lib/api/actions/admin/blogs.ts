// src/lib/api/actions/admin/blogs.ts

import { adminCore } from '@/lib/api/admin-core';
import { ADMIN_ENDPOINTS } from '@/lib/api/admin-endpoints';
import { BlogPost } from '@/lib/types/models';

// ── Response types ────────────────────────────────────────────────────────────

export interface BlogListApiResponse {
  success: boolean;
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
      categories: { name: string; slug: string; count: number }[];
      tags: { name: string; count: number }[];
      sortOptions: string[];
    };
  };
}

export interface BlogSingleApiResponse {
  success: boolean;
  data: BlogPost;
}

export interface BlogMutationApiResponse {
  success: boolean;
  message: string;
  data: BlogPost;
}

export interface BlogDeleteApiResponse {
  success: boolean;
  message: string;
  data: { deletedId: string; title: string };
}

export interface ImageUploadResponse {
  success: boolean;
  url: string;
}

export interface BlogFormData {
  title: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  featuredImageAlt?: string;
  tags?: string;
  category?: string;
  categorySlug?: string;
  focusKeyword?: string;
  relatedPosts?: string[];
  isGuestPost?: boolean;
  authorName?: string;
  authorTitle?: string;
  authorAvatar?: string;
  featuredImage?: File | null;
  removeFeaturedImage?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildFormData(fields: BlogFormData): FormData {
  const fd = new FormData();

  fd.append('title', fields.title);
  fd.append('content', fields.content);

  if (fields.excerpt) fd.append('excerpt', fields.excerpt);
  if (fields.metaTitle) fd.append('metaTitle', fields.metaTitle);
  if (fields.metaDescription) fd.append('metaDescription', fields.metaDescription);
  if (fields.featuredImageAlt) fd.append('featuredImageAlt', fields.featuredImageAlt);
  if (fields.tags) fd.append('tags', fields.tags);
  if (fields.category) fd.append('category', fields.category);
  if (fields.categorySlug) fd.append('categorySlug', fields.categorySlug);
  if (fields.focusKeyword) fd.append('focusKeyword', fields.focusKeyword);
  if (fields.isGuestPost) fd.append('isGuestPost', String(fields.isGuestPost));
  if (fields.authorName) fd.append('authorName', fields.authorName);
  if (fields.authorTitle) fd.append('authorTitle', fields.authorTitle);
  if (fields.authorAvatar) fd.append('authorAvatar', fields.authorAvatar);
  if (fields.removeFeaturedImage) fd.append('removeFeaturedImage', 'true');

  if (fields.relatedPosts?.length) {
    fields.relatedPosts.forEach((id) => fd.append('relatedPosts[]', id));
  }

  if (fields.featuredImage instanceof File) {
    fd.append('featuredImage', fields.featuredImage);
  }

  return fd;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const blogApi = {
  /**
   * GET /blog — paginated list with filters
   * useProxy=true → /api/proxy/blog → public backend
   */
  getAll: (params?: Record<string, unknown>) => {
    const qs = params
      ? '?' +
        new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)]),
        ).toString()
      : '';
    return adminCore.get<BlogListApiResponse>(`${ADMIN_ENDPOINTS.blogs.get}${qs}`, false); // ← false
  },

  /**
   * GET /blog/:slug — fetch a single post by SLUG for the editor
   * useProxy=false → /api/admin/blog/:slug → backend
   */
  getBySlug: (slug: string) => adminCore.get<BlogSingleApiResponse>(`/blog/${slug}`, false),

  /**
   * GET /blog/:id — fetch a single post by MongoDB _id (fallback)
   * @deprecated Use getBySlug instead
   */
  getById: (id: string) =>
    adminCore.get<BlogSingleApiResponse>(ADMIN_ENDPOINTS.blogs.getOne(id), false),

  /**
   * POST /blog — create (multipart)
   */
  create: (fields: BlogFormData) =>
    adminCore.postForm<BlogMutationApiResponse>(
      ADMIN_ENDPOINTS.blogs.create,
      buildFormData(fields),
      false,
    ),

  /**
   * PATCH /blog/:id — update (multipart)
   * NOTE: Still uses ID for updates (backend requires ID for PATCH)
   */
  update: (id: string, fields: Partial<BlogFormData>) =>
    adminCore.patchForm<BlogMutationApiResponse>(
      ADMIN_ENDPOINTS.blogs.update(id),
      buildFormData(fields as BlogFormData),
      false,
    ),

  /**
   * DELETE /blog/:id
   */
  delete: (id: string) =>
    adminCore.delete<BlogDeleteApiResponse>(ADMIN_ENDPOINTS.blogs.delete(id), false),

  /**
   * POST /blog/upload-image — inline image upload
   */
  uploadImage: async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    const fd = new FormData();
    fd.append('image', file);

    const { data, error } = await adminCore.postForm<ImageUploadResponse>(
      ADMIN_ENDPOINTS.blogs.uploadImage,
      fd,
      false,
    );

    if (error || !data?.url) {
      return { success: false, error: error ?? 'Upload failed' };
    }

    return { success: true, url: data.url };
  },
};
