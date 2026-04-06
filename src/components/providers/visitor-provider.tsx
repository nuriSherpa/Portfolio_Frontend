'use client';

import { useEffect } from 'react';
import { initVisitor } from '@/lib/api/actions/visitor';

export function VisitorProvider({ children }: { children: React.ReactNode }) {
  console.log('[visitor] VisitorProvider rendering');

  useEffect(() => {
    console.log('[visitor] useEffect fired'); // ← if this never appears, strict mode or hydration issue
    initVisitor().catch((err) => console.error('[visitor] initVisitor error:', err));
  }, []);

  return <>{children}</>;
}
