// src/hooks/use-admin-check.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  userId: string;
  role: string;
  permissions: string[];
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AdminUser | null;
  error: string | null;
}

const REFRESH_THRESHOLD_SECONDS = 120; // 2 minutes before expiry
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes as fallback

// Singleton pattern to share auth state across components
let globalAuthState: AuthState | null = null;
let globalListeners: Set<(state: AuthState) => void> = new Set();

function notifyListeners(state: AuthState) {
  globalListeners.forEach((listener) => listener(state));
}

async function checkToken(): Promise<{ valid: boolean; exp?: number; user?: AdminUser }> {
  try {
    const res = await fetch('/api/admin/check', { credentials: 'include' });
    if (!res.ok) return { valid: false };
    return await res.json();
  } catch {
    return { valid: false };
  }
}

async function silentRefresh(): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function useAdminCheck(): AuthState {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(
    globalAuthState ?? {
      isLoading: true,
      isAuthenticated: false,
      user: null,
      error: null,
    },
  );

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInitializedRef = useRef(false);

  // Sync with global state
  useEffect(() => {
    const listener = (newState: AuthState) => setState(newState);
    globalListeners.add(listener);
    return () => {
      globalListeners.delete(listener);
    };
  }, []);

  const logout = useCallback(() => {
    globalAuthState = {
      isLoading: false,
      isAuthenticated: false,
      user: null,
      error: 'Session expired',
    };
    notifyListeners(globalAuthState);
    router.replace('/xk92-cms');
  }, [router]);

  const scheduleRefresh = useCallback(
    (exp: number) => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

      const secondsUntilExpiry = exp - Date.now() / 1000;
      const refreshIn = Math.max(0, secondsUntilExpiry - REFRESH_THRESHOLD_SECONDS) * 1000;

      // Only schedule if it's reasonable (not immediate)
      if (refreshIn < 1000) {
        logout();
        return;
      }

      refreshTimerRef.current = setTimeout(async () => {
        const refreshed = await silentRefresh();
        if (!refreshed) {
          logout();
          return;
        }

        const result = await checkToken();
        if (!result.valid || !result.exp) {
          logout();
          return;
        }

        globalAuthState = {
          isLoading: false,
          isAuthenticated: true,
          user: result.user ?? null,
          error: null,
        };
        notifyListeners(globalAuthState);
        scheduleRefresh(result.exp);
      }, refreshIn);
    },
    [logout],
  );

  useEffect(() => {
    // Prevent duplicate initializations (React StrictMode double-mount)
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // If we already have global state and it's not loading, skip init
    if (globalAuthState && !globalAuthState.isLoading) {
      setState(globalAuthState);
      return;
    }

    let cancelled = false;

    async function init() {
      const result = await checkToken();
      if (cancelled) return;

      if (!result.valid || !result.exp || !result.user) {
        const refreshed = await silentRefresh();
        if (cancelled) return;

        if (!refreshed) {
          logout();
          return;
        }

        const retried = await checkToken();
        if (cancelled) return;

        if (!retried.valid || !retried.exp || !retried.user) {
          logout();
          return;
        }

        globalAuthState = {
          isLoading: false,
          isAuthenticated: true,
          user: retried.user,
          error: null,
        };
        notifyListeners(globalAuthState);
        scheduleRefresh(retried.exp);
        return;
      }

      globalAuthState = {
        isLoading: false,
        isAuthenticated: true,
        user: result.user,
        error: null,
      };
      notifyListeners(globalAuthState);
      scheduleRefresh(result.exp);
    }

    init();

    // Fallback: check every 5 minutes in case tab was suspended
    checkIntervalRef.current = setInterval(async () => {
      const result = await checkToken();
      if (!result.valid) {
        const refreshed = await silentRefresh();
        if (!refreshed) logout();
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [logout, scheduleRefresh]);

  return state;
}
