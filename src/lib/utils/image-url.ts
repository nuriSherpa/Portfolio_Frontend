// src/lib/utils/image-url.ts
export const getImageUrl = (url: string | undefined): string => {
  if (!url || url === 'undefined' || url === 'null' || url === '') {
    return '';
  }

  // Decode HTML entities
  const decoded = url.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&');

  // Convert any localhost URL to local path
  // http://localhost:80/uploads/... → /uploads/...
  // http://localhost/uploads/... → /uploads/...
  // http://127.0.0.1:80/uploads/... → /uploads/...
  if (decoded.includes('localhost') || decoded.includes('127.0.0.1')) {
    const urlObj = new URL(decoded);
    return urlObj.pathname; // Returns /uploads/...
  }

  // Already local path
  if (decoded.startsWith('/uploads/')) {
    return decoded;
  }

  return decoded;
};
