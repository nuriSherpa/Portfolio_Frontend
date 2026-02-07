'use client';

import { Suspense, lazy, ComponentType, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Loading fallback component
export function DefaultFallback({ className }: { className?: string }) {
  return <Skeleton className={className || 'h-96 w-full'} />;
}

// Lazy load a component with automatic suspense
export function lazyLoad<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: ReactNode,
) {
  const LazyComponent = lazy(importFunc);

  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Preload component for faster navigation
export function preload<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
) {
  const LazyComponent = lazy(importFunc);
  // Start loading immediately
  const preloadPromise = importFunc();

  return function PreloadedComponent(props: T) {
    return (
      <Suspense fallback={<DefaultFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
