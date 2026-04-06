'use client';

// src/app/(cms-portal)/xk92-cms/blogs/page.tsx
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { blogApi } from '@/lib/api/actions/admin/blogs';
import { BlogPost } from '@/lib/types/models';
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Search,
  Clock,
  Eye,
  Tag,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function BlogListPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await blogApi.getAll({ limit: 100 });
    if (err || !data) {
      setError(err ?? 'Failed to load posts');
    } else {
      setPosts(data.data?.posts ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error: err } = await blogApi.delete(id);
    if (err) {
      setError(err);
    } else {
      setPosts((prev) => prev.filter((p) => p._id !== id));
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some((t) => t.includes(search.toLowerCase())),
  );

  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      {/* Header */}
      <header className="border-b border-black/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/xk92-cms/dashboard"
            className="flex items-center gap-1.5 text-sm text-black/50 hover:text-[var(--color-red)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <span className="text-black/20">/</span>
          <span className="text-sm font-semibold text-[var(--color-black)]">Blog Posts</span>
        </div>
        <Link
          href="/xk92-cms/blogs/new"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-red)] text-[var(--color-white)] text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
          <input
            type="text"
            placeholder="Search posts by title, category or tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-black/10 rounded-lg text-sm text-[var(--color-black)] placeholder:text-black/30 focus:outline-none focus:border-[var(--color-red)] transition-colors"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-4 mb-4 bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 rounded-lg text-sm text-[var(--color-red)]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-red)]" />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-black/40 text-sm mb-4">
              {search ? 'No posts match your search.' : 'No blog posts yet.'}
            </p>
            {!search && (
              <Link
                href="/xk92-cms/blogs/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-red)] text-[var(--color-white)] text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Create your first post
              </Link>
            )}
          </div>
        )}

        {/* Post list */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((post) => (
              <div
                key={post._id}
                className="flex items-start gap-4 p-4 border border-black/10 rounded-xl hover:border-black/20 transition-colors group"
              >
                {/* Thumbnail */}
                {post.featuredImage ? (
                  <div
                    className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0 border border-black/5"
                    style={{ backgroundImage: `url(${post.featuredImage})` }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-black/5 shrink-0 flex items-center justify-center">
                    <span className="text-black/20 text-xs">No img</span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--color-black)] text-sm leading-snug mb-1 truncate">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-xs text-black/40 line-clamp-1 mb-2">{post.excerpt}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-black/40">
                    {post.category && (
                      <span className="px-2 py-0.5 bg-[var(--color-red)]/10 text-[var(--color-red)] rounded-full font-medium">
                        {post.category}
                      </span>
                    )}
                    {post.readingTime != null && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readingTime} min
                      </span>
                    )}
                    {post.views != null && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views.toLocaleString()}
                      </span>
                    )}
                    {post.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                    <span className="ml-auto">
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {confirmDeleteId === post._id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-black/50">Delete?</span>
                      <button
                        onClick={() => handleDelete(post._id)}
                        disabled={deletingId === post._id}
                        className="px-3 py-1.5 text-xs font-medium bg-[var(--color-red)] text-[var(--color-white)] rounded-lg hover:opacity-90 disabled:opacity-50"
                      >
                        {deletingId === post._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          'Yes'
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-1.5 text-xs font-medium border border-black/10 rounded-lg hover:border-black/30 text-[var(--color-black)]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link
                        href={`/xk92-cms/blogs/${post.slug}/edit`}
                        className="p-2 rounded-lg border border-black/10 text-black/50 hover:border-[var(--color-red)] hover:text-[var(--color-red)] transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setConfirmDeleteId(post._id)}
                        className="p-2 rounded-lg border border-black/10 text-black/50 hover:border-[var(--color-red)] hover:text-[var(--color-red)] transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Count */}
        {!loading && posts.length > 0 && (
          <p className="text-xs text-black/30 text-center mt-6">
            {filtered.length} of {posts.length} posts
          </p>
        )}
      </main>
    </div>
  );
}
