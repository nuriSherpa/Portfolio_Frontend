'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  placeholder?: string;
  threshold?: number;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = '',
  containerClassName = '',
  placeholder,
  threshold = 0.1,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Check if src is a valid Next.js Image compatible URL
  const isExternalImage = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isConfiguredDomain = (url: string) => {
    try {
      const parsed = new URL(url);
      // Add your configured domains here or check next.config.js
      const allowedDomains = ['example.com', 'images.unsplash.com', 'github.com'];
      return allowedDomains.some(
        (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`),
      );
    } catch {
      return false;
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setImageSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    console.warn(`Failed to load image: ${src}`);
    setHasError(true);
    setIsLoading(false);

    // Fallback to placeholder or empty state
    if (placeholder) {
      setImageSrc(placeholder);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // If it's an external image and not configured, use regular img tag
  if (isExternalImage(src) && !isConfiguredDomain(src)) {
    return (
      <div className={`relative ${containerClassName}`}>
        {isLoading && <Skeleton className="absolute inset-0 h-full w-full" />}
        <img
          src={src}
          alt={alt}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          style={{
            width: fill ? '100%' : width,
            height: fill ? '100%' : height,
            objectFit: 'cover',
          }}
        />
      </div>
    );
  }

  // Use Next.js Image for configured domains and local images
  return (
    <div className={`relative ${containerClassName}`}>
      {isLoading && <Skeleton className="absolute inset-0 h-full w-full" />}
      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        sizes={fill ? '100vw' : undefined}
        placeholder={placeholder ? 'blur' : 'empty'}
        blurDataURL={placeholder}
      />
    </div>
  );
}
