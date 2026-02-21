// src/lib/utils/image-loader.ts
class ImageCache {
  private cache: Map<string, { url: string; loaded: boolean }> = new Map();
  private maxSize = 30; // Cache up to 30 images

  get(url: string): string | null {
    const cached = this.cache.get(url);
    return cached?.url || null;
  }

  set(url: string, loaded: boolean = true) {
    // Implement LRU: if cache is full, remove oldest
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(url, { url, loaded });
  }

  has(url: string): boolean {
    return this.cache.has(url);
  }

  markAsLoaded(url: string) {
    const existing = this.cache.get(url);
    if (existing) {
      this.cache.set(url, { ...existing, loaded: true });
    }
  }
}

export const imageCache = new ImageCache();

// Generate a tiny blurry placeholder (like Facebook)
export const getBlurPlaceholder = (): string => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='100%25' height='100%25' fill='%23f5f5f5'/%3E%3C/svg%3E`;
};

// Preload critical images
export const preloadImages = (urls: string[]) => {
  if (typeof window === 'undefined') return;

  urls.forEach((url) => {
    if (!imageCache.has(url)) {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        imageCache.set(url);
      };
    }
  });
};
