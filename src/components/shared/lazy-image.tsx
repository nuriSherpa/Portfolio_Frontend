// src/components/shared/lazy-image.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils/cn';

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
  fadeIn?: boolean;
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
  fadeIn = true,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadedRef = useRef(false);

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Safe URL validation that works on both server and client
  const isValidUrl = (urlString: string): boolean => {
    try {
      // On server, just check if it's a valid URL without base
      if (!isClient) {
        // Simple check for server-side
        return (
          urlString.startsWith('http://') ||
          urlString.startsWith('https://') ||
          urlString.startsWith('/')
        );
      }

      // On client, use full validation with base
      new URL(urlString, window.location.origin);
      return true;
    } catch {
      return false;
    }
  };

  const isExternalImage = (urlString: string): boolean => {
    if (!isValidUrl(urlString)) return false;

    try {
      // On server, just check protocol from string
      if (!isClient) {
        return urlString.startsWith('http://') || urlString.startsWith('https://');
      }

      // On client, use full URL parsing
      const url = new URL(urlString, window.location.origin);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isConfiguredDomain = (urlString: string): boolean => {
    if (!isValidUrl(urlString) || !isClient) return false; // Skip domain check on server

    try {
      const url = new URL(urlString, window.location.origin);
      // Check if it matches your Next.js config remote patterns
      const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      const isConfiguredPort = url.port === '9090' || url.port === '80';
      const isUploadsPath = url.pathname.startsWith('/uploads/');

      return (isLocalhost && isConfiguredPort && isUploadsPath) || !url.hostname.includes('.');
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    // Only setup observer on client
    if (!isClient) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      { threshold, rootMargin: '50px' },
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, threshold, isClient]);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    loadedRef.current = false;
  }, [src]);

  const handleError = useCallback(() => {
    if (loadedRef.current) return;

    console.warn(`Failed to load image: ${src}`);
    setHasError(true);
    setIsLoading(false);
    loadedRef.current = true;
  }, [src]);

  const handleLoad = useCallback(() => {
    if (loadedRef.current) return;

    setIsLoading(false);
    loadedRef.current = true;
  }, []);

  // On server or before client hydration, render a simple placeholder
  if (!isClient) {
    return (
      <div className={cn('relative bg-grey-100', fill ? 'h-full w-full' : '', containerClassName)}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-grey-400 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  const shouldLoad = priority || isInView;
  const isExternal = isExternalImage(src);

  if (!src) {
    return (
      <div className={cn('relative bg-grey-100', containerClassName)}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-grey-400 text-sm">No image</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={cn('relative', fill ? 'h-full w-full' : '', containerClassName)}>
      {isLoading && shouldLoad && (
        <Skeleton className={cn('absolute inset-0 h-full w-full', fadeIn && 'animate-pulse')} />
      )}

      {shouldLoad &&
        !hasError &&
        (isExternal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className={cn(
              className,
              fadeIn && 'transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100',
            )}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
            style={{
              width: fill ? '100%' : width,
              height: fill ? '100%' : height,
              objectFit: 'cover',
            }}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            fill={fill}
            priority={priority}
            className={cn(
              className,
              fadeIn && 'transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100',
            )}
            onLoad={handleLoad}
            onError={handleError}
            sizes={fill ? '100vw' : undefined}
            placeholder={placeholder ? 'blur' : 'empty'}
            blurDataURL={placeholder}
            quality={90}
            unoptimized={process.env.NODE_ENV === 'development'} // Match your next.config
          />
        ))}

      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-grey-100">
          <span className="text-grey-400 text-sm">Failed to load</span>
        </div>
      )}
    </div>
  );
}
