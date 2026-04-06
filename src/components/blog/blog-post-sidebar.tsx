'use client';

// src/components/blog/blog-post-sidebar.tsx
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { BlogPost } from '@/lib/types/models';
import { ArrowLeft, Link2, Check } from 'lucide-react';
import { FaLinkedinIn, FaFacebookF } from 'react-icons/fa';
import { BsTwitterX } from 'react-icons/bs';
import Image from 'next/image';

interface BlogPostSidebarProps {
  post: BlogPost;
}

export function BlogPostSidebar({ post }: BlogPostSidebarProps) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : (post.canonicalUrl ?? '');
  const shareTitle = post.title ?? '';

  const toc = post.toc ?? [];
  const authorName = post.author?.name ?? 'Tendinuri Sherpa';
  const authorTitle = post.author?.title ?? 'Full Stack Developer';
  const authorAvatar = post.author?.avatar ?? '/default-avatar.jpg';

  // ── Scroll spy — listens to events dispatched by BlogPostContent ───────────
  useEffect(() => {
    if (toc.length === 0) return;

    const handleHeadingInView = (e: CustomEvent) => setActiveId(e.detail.activeId);
    window.addEventListener('headingInView', handleHeadingInView as EventListener);

    // Activate first TOC item on mount
    const timer = setTimeout(() => {
      if (toc[0]?.id && document.getElementById(toc[0].id)) {
        setActiveId(toc[0].id);
      }
    }, 500);

    return () => {
      window.removeEventListener('headingInView', handleHeadingInView as EventListener);
      clearTimeout(timer);
    };
  }, [toc]);

  const handleTocClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 100,
        behavior: 'smooth',
      });
      window.history.pushState(null, '', `#${id}`);
      setActiveId(id);
    }
  }, []);

  // ── Share handlers ─────────────────────────────────────────────────────────
  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${shareTitle} ${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'width=600,height=400');
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      '_blank',
      'width=600,height=400',
    );
  };

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400',
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const el = document.createElement('input');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleCategoryClick = () => {
    if (post.categorySlug) router.push(`/blog?category=${post.categorySlug}`);
  };

  const handleTagClick = (tag: string) => {
    router.push(`/blog?tags=${encodeURIComponent(tag)}`);
  };

  // ── Shared button styles ───────────────────────────────────────────────────
  const sectionClass = 'bg-grey-100 rounded-xl p-5';
  const headingClass = 'font-bold text-[var(--color-black)] mb-3 text-sm uppercase tracking-wide';
  const socialBtnClass =
    'p-2.5 border border-grey-200 text-grey-600 hover:border-[var(--color-red)] hover:text-[var(--color-red)] transition-all rounded-full hover:scale-110';

  return (
    <div className="sticky top-8 space-y-6">
      {/* Back */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-grey-600 hover:text-[var(--color-red)] transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blog
      </Link>

      {/* Category */}
      {post.category && (
        <div className={sectionClass}>
          <h3 className={headingClass}>Category</h3>
          <button
            onClick={handleCategoryClick}
            className="px-3 py-1.5 bg-[var(--color-red)] text-[var(--color-white)] text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
          >
            {post.category}
          </button>
        </div>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className={sectionClass}>
          <h3 className={headingClass}>Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1 bg-[var(--color-white)] text-grey-600 text-sm rounded-full hover:bg-[var(--color-red)] hover:text-[var(--color-white)] transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table of Contents */}
      {toc.length > 0 && (
        <div className={sectionClass}>
          <h3 className={headingClass}>Contents</h3>
          <nav className="space-y-1">
            {toc.map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleTocClick(e, item.id)}
                  className={`block text-sm transition-all duration-200 cursor-pointer border-l-2 py-1 ${
                    item.level === 1 ? 'pl-3' : 'pl-6'
                  } ${
                    isActive
                      ? 'border-[var(--color-red)] text-[var(--color-red)] font-medium bg-[var(--color-red)]/5'
                      : 'border-transparent text-grey-600 hover:text-[var(--color-black)] hover:bg-grey-200/50'
                  }`}
                >
                  {item.text}
                </a>
              );
            })}
          </nav>
        </div>
      )}

      {/* Share */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Share</h3>
        <div className="flex items-center gap-2">
          <button onClick={handleTwitterShare} aria-label="Share on X" className={socialBtnClass}>
            <BsTwitterX size={14} />
          </button>
          <button
            onClick={handleLinkedInShare}
            aria-label="Share on LinkedIn"
            className={socialBtnClass}
          >
            <FaLinkedinIn size={14} />
          </button>
          <button
            onClick={handleFacebookShare}
            aria-label="Share on Facebook"
            className={socialBtnClass}
          >
            <FaFacebookF size={14} />
          </button>
          <button
            onClick={handleCopyLink}
            aria-label={linkCopied ? 'Link copied!' : 'Copy link'}
            className={`p-2.5 border transition-all rounded-full hover:scale-110 ${
              linkCopied
                ? 'border-[var(--color-red)] text-[var(--color-red)] bg-[var(--color-red)]/5'
                : 'border-grey-200 text-grey-600 hover:border-[var(--color-red)] hover:text-[var(--color-red)]'
            }`}
          >
            {linkCopied ? <Check size={14} /> : <Link2 size={14} />}
          </button>
          {linkCopied && (
            <span className="text-xs text-[var(--color-red)] font-medium">Link copied!</span>
          )}
        </div>
      </div>

      {/* Author */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Author</h3>
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-grey-200 shrink-0">
            <Image src={authorAvatar} alt={authorName} fill className="object-cover" sizes="40px" />
          </div>
          <div>
            <p className="font-medium text-[var(--color-black)] text-sm">{authorName}</p>
            {authorTitle && <p className="text-xs text-grey-500">{authorTitle}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
