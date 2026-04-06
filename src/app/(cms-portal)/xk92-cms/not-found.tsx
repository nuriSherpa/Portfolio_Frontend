// src/app/(cms-portal)/xk92-cms/not-found.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { verifyAdminToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS_TOKEN } from '@/lib/auth/cookies';

export default async function AdminNotFound() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let isAuthenticated = false;

  if (accessToken) {
    const payload = await verifyAdminToken(accessToken);
    isAuthenticated = !!payload;
  }

  if (!isAuthenticated) {
    redirect('/xk92-cms');
  }

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-black">404</h1>
      <p className="mt-4 text-lg sm:text-xl text-grey-500 font-medium">Page not found</p>
      <p className="mt-2 text-sm sm:text-base text-grey-400 text-center max-w-md">
        The admin page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/xk92-cms/dashboard"
        className="group mt-8 inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium"
      >
        <ArrowLeft
          size={18}
          className="transition-transform duration-300 group-hover:-translate-x-1"
        />
        Back to Dashboard
      </Link>
    </div>
  );
}
