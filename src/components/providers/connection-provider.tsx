'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { ConnectionLost } from '@/components/shared/connection-lost';

interface ConnectionContextType {
  isConnected: boolean;
  isIdle: boolean;
  checkConnection: () => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

// Global state to persist across renders
let globalIsConnected: boolean | null = null;
let lastHealthCheck = 0;
const MIN_CHECK_INTERVAL = 5000;

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean | null>(globalIsConnected);
  const [isIdle, setIsIdle] = useState(false);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);
  const isActiveRef = useRef(true);
  const hasInitialized = useRef(false);

  const checkConnection = useCallback(async (force = false) => {
    // Prevent concurrent checks
    if (isCheckingRef.current) return;

    // Respect minimum interval unless forced
    const now = Date.now();
    if (!force && now - lastHealthCheck < MIN_CHECK_INTERVAL) return;

    // Don't check if idle
    if (!force && !isActiveRef.current) return;

    isCheckingRef.current = true;
    lastHealthCheck = now;

    try {
      // ADD THIS LINE TO VERIFY NEW CODE IS RUNNING
      console.log('✅ NEW CONNECTION PROVIDER V2 - USING RELATIVE URL');

      // Use relative URL with cache-busting timestamp
      const response = await fetch(`/api/v1/health?_=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('[Connection] Health check status:', response.status);

      if (response.ok) {
        globalIsConnected = true;
        setIsConnected(true);
      } else {
        // API returned error but backend is reachable
        globalIsConnected = true;
        setIsConnected(true);
      }
    } catch (error: any) {
      // Network error - backend is down
      console.error('[Connection] Health check failed:', error.message);
      globalIsConnected = false;
      setIsConnected(false);
    } finally {
      isCheckingRef.current = false;
    }
  }, []);

  const resetIdleTimer = useCallback(() => {
    isActiveRef.current = true;
    setIsIdle(false);

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      isActiveRef.current = false;
      setIsIdle(true);
      console.log('[Connection] User idle - pausing health checks');
    }, IDLE_TIMEOUT);
  }, []);

  // Initialize once only
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    console.log('🔧 ConnectionProvider mounted - V2 WITH RELATIVE URL');

    // Activity listeners
    const activities = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => resetIdleTimer();

    activities.forEach((activity) => {
      window.addEventListener(activity, handleActivity, { passive: true });
    });

    // Initial check
    checkConnection(true);

    // Set up interval
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current && !isCheckingRef.current) {
        checkConnection();
      }
    }, HEALTH_CHECK_INTERVAL);

    // Start idle timer
    resetIdleTimer();

    // Cleanup
    return () => {
      activities.forEach((activity) => {
        window.removeEventListener(activity, handleActivity);
      });
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkConnection, resetIdleTimer]);

  // Loading state
  if (isConnected === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent" />
      </div>
    );
  }

  if (!isConnected) {
    return <ConnectionLost onReconnect={() => checkConnection(true)} />;
  }

  return (
    <ConnectionContext.Provider value={{ isConnected, isIdle, checkConnection }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) throw new Error('useConnection must be used within ConnectionProvider');
  return context;
}
