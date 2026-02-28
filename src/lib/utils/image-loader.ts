// src/lib/utils/image-loader.ts
// Robust image cache with size limit to prevent memory leaks
class ImageCache {
  private cache: Map<string, boolean> = new Map();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  has(url: string): boolean {
    return this.cache.has(url);
  }

  set(url: string): void {
    // LRU eviction if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(url)) {
      const firstKey = this.cache.keys().next().value;
      // Add null check - firstKey should exist since size >= maxSize > 0
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(url, true);
  }

  // Optional: Add clear method for cleanup
  clear(): void {
    this.cache.clear();
  }

  // Optional: Get cache size for debugging
  size(): number {
    return this.cache.size;
  }
}

export const imageCache = new ImageCache(100);

// Tiny blur placeholder
export const getBlurPlaceholder = (): string => {
  return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=';
};
