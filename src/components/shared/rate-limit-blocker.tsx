'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface RateLimitBlockerProps {
  retryAfter: number;
  onRetry: () => void;
}

export function RateLimitBlocker({ retryAfter, onRetry }: RateLimitBlockerProps) {
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

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <Clock size={64} className="text-red" />
        </div>

        <h2 className="text-2xl font-bold text-black mb-4">Slow Down</h2>

        <p className="text-grey-600 mb-8">
          You're making requests too quickly. Please wait before trying again.
        </p>

        <div className="text-4xl font-bold text-red mb-8">{countdown}s</div>

        <button
          disabled={countdown > 0}
          onClick={onRetry}
          className="px-6 py-3 bg-black text-white font-medium hover:bg-grey-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {countdown > 0 ? 'Please wait...' : 'Try Again'}
        </button>
      </div>
    </div>
  );
}
