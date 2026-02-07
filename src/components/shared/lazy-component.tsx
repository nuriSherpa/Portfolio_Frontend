'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyComponentProps<T extends object> {
  component: () => Promise<{ default: ComponentType<T> }>;
  props?: T;
  fallback?: React.ReactNode;
}

export function LazyComponent<T extends object>({
  component,
  props,
  fallback,
}: LazyComponentProps<T>) {
  const LazyLoadedComponent = lazy(component);

  return (
    <Suspense fallback={fallback || <Skeleton className="h-96 w-full" />}>
      <LazyLoadedComponent {...(props as T)} />
    </Suspense>
  );
}
