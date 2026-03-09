// src/app/not-found.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4">
      {/* 404 - Plain black, no effects */}
      <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-black">404</h1>

      {/* Page not found */}
      <p className="mt-4 text-lg sm:text-xl text-grey-500 font-medium">Page not found</p>

      {/* Description */}
      <p className="mt-2 text-sm sm:text-base text-grey-400 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>

      {/* Go home button - Only arrow animates */}
      <Link
        href="/"
        className="group mt-8 inline-flex items-center gap-2 px-6 py-3 bg-red text-white rounded-lg font-medium"
      >
        <ArrowLeft
          size={18}
          className="transition-transform duration-300 group-hover:-translate-x-1"
        />
        Go Home
      </Link>
    </div>
  );
}
