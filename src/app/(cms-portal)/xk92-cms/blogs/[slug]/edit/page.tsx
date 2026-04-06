// src/app/(cms-portal)/xk92-cms/blogs/[slug]/edit/page.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { blogApi, BlogFormData } from '@/lib/api/actions/admin/blogs';
import { RichTextEditor } from '@/components/cms/Richtexteditor';
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from 'lucide-react';

// ── Components ───────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[var(--color-black)] uppercase tracking-wide">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-black/40">{hint}</p>}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  maxLength,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: string;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm text-[var(--color-black)] placeholder:text-black/30 focus:outline-none focus:border-[var(--color-red)] transition-colors"
      />
      {maxLength && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-black/30">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm text-[var(--color-black)] placeholder:text-black/30 focus:outline-none focus:border-[var(--color-red)] transition-colors resize-none"
      />
      {maxLength && (
        <span className="absolute right-3 bottom-3 text-xs text-black/30">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

// ── Empty defaults ────────────────────────────────────────────────────────────

const EMPTY: BlogFormData = {
  title: '',
  content: '',
  excerpt: '',
  metaTitle: '',
  metaDescription: '',
  featuredImageAlt: '',
  tags: '',
  category: '',
  categorySlug: '',
  focusKeyword: '',
  featuredImage: null,
  removeFeaturedImage: false,
  isGuestPost: false,
  authorName: '',
  authorTitle: '',
  authorAvatar: '',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BlogEditorPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [form, setForm] = useState<BlogFormData>(EMPTY);
  const [existingFeaturedImage, setExistingFeaturedImage] = useState<string | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [postId, setPostId] = useState<string>('');

  const fetchState = useRef<'idle' | 'fetching' | 'done'>('idle');

  const set = useCallback(
    <K extends keyof BlogFormData>(key: K, val: BlogFormData[K]) =>
      setForm((prev) => ({ ...prev, [key]: val })),
    [],
  );

  // ── Load post by SLUG ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!slug || fetchState.current !== 'idle') return;
    fetchState.current = 'fetching';

    blogApi.getBySlug(slug).then(({ data, error: err }) => {
      fetchState.current = 'done';

      if (err || !data) {
        setError(err ?? 'Post not found');
        setLoading(false);
        return;
      }

      const post = data.data;
      setPostId(post._id);

      setForm({
        title: post.title ?? '',
        content: post.content ?? '',
        excerpt: post.excerpt ?? '',
        metaTitle: post.metaTitle ?? '',
        metaDescription: post.metaDescription ?? '',
        featuredImageAlt: post.featuredImageAlt ?? '',
        tags: post.tags?.join(', ') ?? '',
        category: post.category ?? '',
        categorySlug: post.categorySlug ?? '',
        focusKeyword: post.focusKeyword ?? '',
        featuredImage: null,
        removeFeaturedImage: false,
        isGuestPost: post.author?.isGuest ?? false,
        authorName: post.author?.isGuest ? (post.author.name ?? '') : '',
        authorTitle: post.author?.isGuest ? (post.author.title ?? '') : '',
        authorAvatar: post.author?.isGuest ? (post.author.avatar ?? '') : '',
      });

      if (post.featuredImage) setExistingFeaturedImage(post.featuredImage);
      setLoading(false);
    });
  }, [slug]);

  // ── Featured image ─────────────────────────────────────────────────────────

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    set('featuredImage', file);
    set('removeFeaturedImage', false);
    if (file) setFeaturedPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleRemoveFeaturedImage = () => {
    set('featuredImage', null);
    set('removeFeaturedImage', true);
    setFeaturedPreview(null);
    setExistingFeaturedImage(null);
  };

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!form.content.trim()) {
      setError('Content is required');
      return;
    }
    if (!postId) {
      setError('Post ID not found');
      return;
    }

    setSaving(true);
    setError(null);

    const { data, error: err } = await blogApi.update(postId, form);

    setSaving(false);

    if (err || !data) {
      setError(err ?? 'Update failed');
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-white)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-red)]" />
      </div>
    );
  }

  const currentImage = featuredPreview ?? existingFeaturedImage;

  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-black/10 bg-[var(--color-white)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/xk92-cms/blogs"
            className="flex items-center gap-1.5 text-sm text-black/50 hover:text-[var(--color-red)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Posts
          </Link>
          <span className="text-black/20">/</span>
          <span className="text-sm font-semibold text-[var(--color-black)] truncate max-w-[240px]">
            {form.title || 'Edit Post'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-red)]">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-red)] text-[var(--color-white)] text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 rounded-lg text-sm text-[var(--color-red)]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="space-y-5 p-6 border border-black/10 rounded-xl">
          <h2 className="text-sm font-bold text-[var(--color-black)] uppercase tracking-wide">
            Content
          </h2>

          <Field label="Title" hint="Max 60 characters">
            <Input
              value={form.title}
              onChange={(v) => set('title', v)}
              placeholder="Post title…"
              maxLength={60}
            />
          </Field>

          <Field label="Content">
            <RichTextEditor
              value={form.content}
              onChange={(html) => set('content', html)}
              placeholder="Write your post…"
              minHeight={500}
            />
          </Field>

          <Field label="Excerpt" hint="Auto-generated if blank">
            <Textarea
              value={form.excerpt ?? ''}
              onChange={(v) => set('excerpt', v)}
              placeholder="Brief description…"
              maxLength={300}
              rows={2}
            />
          </Field>
        </div>

        {/* Featured image */}
        <div className="space-y-4 p-6 border border-black/10 rounded-xl">
          <h2 className="text-sm font-bold text-[var(--color-black)] uppercase tracking-wide">
            Featured Image
          </h2>
          <p className="text-xs text-black/40">Optional. Inline images go into the editor above.</p>

          {currentImage ? (
            <div className="relative group w-full max-w-sm">
              <img
                src={currentImage}
                alt="Featured"
                className="w-full aspect-video object-cover rounded-lg border border-black/10"
              />
              <button
                type="button"
                onClick={handleRemoveFeaturedImage}
                className="absolute top-2 right-2 p-1.5 bg-[var(--color-red)] text-[var(--color-white)] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full max-w-sm aspect-video border-2 border-dashed border-black/10 rounded-lg cursor-pointer hover:border-[var(--color-red)]/40 hover:bg-black/[0.02] transition-colors">
              <ImageIcon className="w-8 h-8 text-black/20 mb-2" />
              <span className="text-xs text-black/40">Click to upload featured image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFeaturedImageChange}
              />
            </label>
          )}

          <Field label="Alt Text" hint="Max 125 characters">
            <Input
              value={form.featuredImageAlt ?? ''}
              onChange={(v) => set('featuredImageAlt', v)}
              placeholder="Describe the image…"
              maxLength={125}
            />
          </Field>
        </div>

        {/* Taxonomy */}
        <div className="space-y-4 p-6 border border-black/10 rounded-xl">
          <h2 className="text-sm font-bold text-[var(--color-black)] uppercase tracking-wide">
            Taxonomy
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category">
              <Input
                value={form.category ?? ''}
                onChange={(v) => set('category', v)}
                placeholder="e.g. Web Development"
              />
            </Field>
            <Field label="Category Slug" hint="Auto-generated if blank">
              <Input
                value={form.categorySlug ?? ''}
                onChange={(v) => set('categorySlug', v)}
                placeholder="e.g. web-development"
              />
            </Field>
          </div>

          <Field label="Tags" hint="Comma-separated">
            <Input
              value={form.tags ?? ''}
              onChange={(v) => set('tags', v)}
              placeholder="react, typescript, nextjs"
            />
          </Field>

          <Field label="Focus Keyword">
            <Input
              value={form.focusKeyword ?? ''}
              onChange={(v) => set('focusKeyword', v)}
              placeholder="e.g. nextjs tutorial"
            />
          </Field>
        </div>

        {/* SEO */}
        <div className="border border-black/10 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setSeoOpen((o) => !o)}
            className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold text-[var(--color-black)] uppercase tracking-wide hover:bg-black/[0.02] transition-colors"
          >
            SEO Settings
            {seoOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {seoOpen && (
            <div className="px-6 pb-6 space-y-4 border-t border-black/10">
              <Field label="Meta Title" hint="Max 60 characters">
                <Input
                  value={form.metaTitle ?? ''}
                  onChange={(v) => set('metaTitle', v)}
                  placeholder="SEO title…"
                  maxLength={60}
                />
              </Field>
              <Field label="Meta Description" hint="Max 160 characters">
                <Textarea
                  value={form.metaDescription ?? ''}
                  onChange={(v) => set('metaDescription', v)}
                  placeholder="SEO description…"
                  maxLength={160}
                  rows={2}
                />
              </Field>
            </div>
          )}
        </div>

        {/* Guest Author */}
        <div className="border border-black/10 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setGuestOpen((o) => !o)}
            className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold text-[var(--color-black)] uppercase tracking-wide hover:bg-black/[0.02] transition-colors"
          >
            Guest Author
            {guestOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {guestOpen && (
            <div className="px-6 pb-6 space-y-4 border-t border-black/10">
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => set('isGuestPost', !form.isGuestPost)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isGuestPost ? 'bg-[var(--color-red)]' : 'bg-black/10'}`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-[var(--color-white)] rounded-full shadow transition-transform ${form.isGuestPost ? 'translate-x-5' : ''}`}
                  />
                </button>
                <span className="text-sm text-[var(--color-black)]">This is a guest post</span>
              </div>
              {form.isGuestPost && (
                <div className="space-y-4">
                  <Field label="Author Name">
                    <Input
                      value={form.authorName ?? ''}
                      onChange={(v) => set('authorName', v)}
                      placeholder="Full name"
                    />
                  </Field>
                  <Field label="Author Title">
                    <Input
                      value={form.authorTitle ?? ''}
                      onChange={(v) => set('authorTitle', v)}
                      placeholder="e.g. Frontend Engineer"
                    />
                  </Field>
                  <Field label="Author Avatar URL">
                    <Input
                      value={form.authorAvatar ?? ''}
                      onChange={(v) => set('authorAvatar', v)}
                      placeholder="https://…"
                    />
                  </Field>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom save */}
        <div className="flex justify-end pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-red)] text-[var(--color-white)] text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Update Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
