'use client';

import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  statusCode?: number;
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorDisplay({
  statusCode = 500,
  title = 'Something went wrong',
  message = 'We encountered an error while loading this page.',
  onRetry,
}: ErrorDisplayProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <AlertTriangle size={64} className="text-red" />
        </div>

        <h1 className="text-6xl font-bold text-black mb-4">{statusCode}</h1>

        <h2 className="text-2xl font-semibold text-black mb-4">{title}</h2>

        <p className="text-grey-600 mb-8">{message}</p>

        <div className="flex gap-4 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-medium hover:bg-grey-800 transition-colors"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          )}

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-black text-black font-medium hover:bg-black hover:text-white transition-colors"
          >
            <Home size={18} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
