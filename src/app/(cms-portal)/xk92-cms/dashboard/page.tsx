'use client';

// src/app/(cms-portal)/xk92-cms/dashboard/page.tsx

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminLogout } from '@/lib/api/actions/admin/auth';
import {
  LayoutDashboard,
  Image as ImageIcon,
  FolderKanban,
  BookOpen,
  User,
  LogOut,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

const CMS_SECTIONS = [
  {
    href: '/xk92-cms/hero',
    label: 'Hero Section',
    description: 'Edit headline, bio and profile image',
    icon: ImageIcon,
  },
  {
    href: '/xk92-cms/projects',
    label: 'Projects',
    description: 'Manage portfolio projects',
    icon: FolderKanban,
  },
  {
    href: '/xk92-cms/blogs',
    label: 'Blog Posts',
    description: 'Create, edit and delete blog posts',
    icon: BookOpen,
  },
  {
    href: '/xk92-cms/about',
    label: 'About',
    description: 'Update your bio and experience',
    icon: User,
  },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username?: string; id?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Tracks whether the fetch has already been fired.
  // A plain module-level variable works better than useRef here because
  // React StrictMode unmounts+remounts the component but keeps module scope.
  // However useRef persists across StrictMode remounts in the same session,
  // so we combine: skip if already fetching OR already resolved.
  const fetchState = useRef<'idle' | 'fetching' | 'done'>('idle');

  useEffect(() => {
    // Skip if a fetch is already in flight or completed
    if (fetchState.current !== 'idle') return;
    fetchState.current = 'fetching';

    fetch('/api/admin/check', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    })
      .then(async (res) => {
        fetchState.current = 'done';

        // Always parse — even 401 returns JSON
        const data = await res.json().catch(() => ({ authenticated: false }));
        console.log('[Dashboard] check →', res.status, data);

        if (!data.authenticated) {
          router.replace('/xk92-cms');
          return;
        }

        setUser(data.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        fetchState.current = 'done';
        console.error('[Dashboard] check error:', err);
        setAuthError(`Session check failed: ${err.message}`);
        setLoading(false);
      });

    // No cleanup / no AbortController.
    // Aborting in cleanup is what causes the StrictMode issue —
    // cleanup fires between the two mounts, cancelling the fetch
    // before it can resolve.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await adminLogout();
  };

  const handleRetry = () => {
    fetchState.current = 'idle';
    setLoading(true);
    setAuthError(null);

    fetch('/api/admin/check', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({ authenticated: false }));
        if (!data.authenticated) {
          router.replace('/xk92-cms');
          return;
        }
        setUser(data.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        setAuthError(`Session check failed: ${err.message}`);
        setLoading(false);
      });
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-white)] flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-[var(--color-red)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-black/40">Verifying session…</p>
      </div>
    );
  }

  // ── Auth error ─────────────────────────────────────────────────────────────
  if (authError) {
    return (
      <div className="min-h-screen bg-[var(--color-white)] flex items-center justify-center p-6">
        <div className="max-w-sm w-full space-y-4">
          <div className="flex items-start gap-3 p-4 bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 rounded-xl text-sm text-[var(--color-red)]">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 py-2 text-sm font-medium border border-black/10 rounded-lg hover:border-black/30 text-[var(--color-black)] transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => router.replace('/xk92-cms')}
              className="flex-1 py-2 text-sm font-medium bg-[var(--color-red)] text-[var(--color-white)] rounded-lg hover:opacity-90 transition-opacity"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      <header className="border-b border-black/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-[var(--color-red)]" />
          <span className="font-bold text-[var(--color-black)] tracking-tight">CMS Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-black/50">{user?.username ?? 'Admin'}</span>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-white)] bg-[var(--color-red)] rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? 'Logging out…' : 'Logout'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--color-black)] mb-1">
            Welcome back, {user?.username ?? 'Admin'}
          </h1>
          <p className="text-black/50 text-sm">What would you like to manage today?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CMS_SECTIONS.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 p-5 border border-black/10 rounded-xl hover:border-[var(--color-red)] hover:shadow-sm transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--color-red)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-red)] transition-colors">
                <Icon className="w-5 h-5 text-[var(--color-red)] group-hover:text-[var(--color-white)] transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--color-black)] text-sm">{label}</p>
                <p className="text-xs text-black/50 mt-0.5 truncate">{description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-black/30 group-hover:text-[var(--color-red)] transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
