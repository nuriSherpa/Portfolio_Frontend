'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CooldownBlockerProps {
  retryAfter: number;
  onRetry: () => void;
}

export function CooldownBlocker({ retryAfter, onRetry }: CooldownBlockerProps) {
  const [countdown, setCountdown] = useState(retryAfter);

  useEffect(() => {
    if (countdown <= 0) {
      onRetry();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, onRetry]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <Clock size={64} className="text-red" />
        </div>

        <h1 className="text-3xl font-bold text-black mb-4">Too Many Requests</h1>

        <p className="text-grey-600 mb-8">
          You've made too many requests. Please wait before trying again.
        </p>

        <div className="text-6xl font-bold text-red mb-8 font-mono">{formatTime(countdown)}</div>

        <button
          disabled={countdown > 0}
          onClick={onRetry}
          className="px-6 py-3 bg-black text-white font-medium hover:bg-grey-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {countdown > 0 ? 'Please wait...' : 'Try Again'}
        </button>

        <p className="mt-4 text-sm text-grey-400">Error code: RATE_LIMITED</p>
      </div>
    </div>
  );
}
