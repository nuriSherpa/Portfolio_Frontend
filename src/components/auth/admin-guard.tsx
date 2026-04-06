// src/components/auth/admin-guard.tsx
'use client';

import { useAdminAuth } from '@/components/providers/admin-auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Wait for pathname to be available
    if (!pathname) return;

    if (!isLoading && !isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace('/xk92-cms');
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
