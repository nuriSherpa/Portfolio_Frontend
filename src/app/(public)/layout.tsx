// src/app/(public)/layout.tsx
'use client';

import { Navbar } from '@/components/layout/navbar'; // ← Changed from shared
import { Footer } from '@/components/layout/footer'; // ← Changed from shared
import { useVisitor, getStoredCooldown, clearStoredCooldown } from '@/hooks/use-visitor';
import { ConnectionProvider } from '@/components/providers/connection-provider';
import { CooldownBlocker } from '@/components/shared/cooldown-blocker';
import { useState, useEffect } from 'react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);

  useEffect(() => {
    const stored = getStoredCooldown();
    if (stored) {
      setCooldownSeconds(stored);
    }
  }, []);

  if (cooldownSeconds !== null && cooldownSeconds > 0) {
    return (
      <CooldownBlocker
        retryAfter={cooldownSeconds}
        onRetry={() => {
          clearStoredCooldown();
          window.location.reload();
        }}
      />
    );
  }

  return (
    <ConnectionProvider>
      <LayoutContent>{children}</LayoutContent>
    </ConnectionProvider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isReady, isBlocked, cooldownSeconds } = useVisitor();

  if (isBlocked && cooldownSeconds > 0) {
    return (
      <CooldownBlocker retryAfter={cooldownSeconds} onRetry={() => window.location.reload()} />
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
