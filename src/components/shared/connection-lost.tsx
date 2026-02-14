'use client';

import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import api from '@/lib/api/axios';

interface ConnectionLostProps {
  onReconnect?: () => void;
}

export function ConnectionLost({ onReconnect }: ConnectionLostProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleRetry();
    }
  }, [countdown]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Try to ping backend
      await api.get('/hero', { timeout: 3000 });
      onReconnect?.();
    } catch (error) {
      setIsRetrying(false);
      setCountdown(5); // Reset countdown
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <WifiOff size={64} className="text-red" />
        </div>

        <h1 className="text-3xl font-bold text-black mb-4">Connection Lost</h1>

        <p className="text-grey-600 mb-2">Unable to connect to the server.</p>
        <p className="text-grey-400 text-sm mb-8">
          Please check if the backend is running on port 9090
        </p>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-medium hover:bg-grey-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={isRetrying ? 'animate-spin' : ''} />
            {isRetrying ? 'Connecting...' : 'Retry Now'}
          </button>

          <p className="text-sm text-grey-400">Auto-retry in {countdown} seconds...</p>
        </div>
      </div>
    </div>
  );
}
