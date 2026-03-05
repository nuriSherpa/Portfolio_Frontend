// src/lib/utils/image-url.ts
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';

  // If it's a full URL with localhost, extract just the path for rewrites
  if (path.includes('localhost')) {
    try {
      const url = new URL(path);
      return url.pathname; // Returns '/uploads/about/...'
    } catch {
      // If URL parsing fails, return as is
      return path;
    }
  }

  // If it's already a path starting with /uploads, use it directly
  if (path.startsWith('/uploads')) {
    return path;
  }

  // Otherwise, assume it's a filename and construct the path
  return `/uploads/${path}`;
}
