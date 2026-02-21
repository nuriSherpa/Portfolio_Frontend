// src/lib/utils/image.ts
export const getOptimizedImageUrl = (
  url: string,
  width: number = 400,
  quality: number = 80,
): string => {
  if (!url) return '';

  // If it's a Sanity image
  if (url.includes('cdn.sanity.io')) {
    return `${url}?w=${width}&q=${quality}&auto=format&fit=max`;
  }

  // If it's a Cloudinary image
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},q_${quality}/`);
  }

  // For other images, just return as is
  return url;
};

export const fixUrl = (url: string | undefined): string => {
  if (!url || url === 'undefined' || url === 'null' || url === '') return '';
  return url.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&');
};
