'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { BlogPost } from '@/lib/types/models';
import { ArrowLeft, Share2, Twitter, Linkedin, Facebook } from 'lucide-react';
import Image from 'next/image';

interface BlogPostSidebarProps {
  post: BlogPost;
}

export function BlogPostSidebar({ post }: BlogPostSidebarProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [headingsReady, setHeadingsReady] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : post.canonicalUrl || '';
  const shareText = `Check out "${post.title}" by ${post.author?.name || 'Author'}`;

  const toc = post.toc || [];

  // Author data with fallbacks
  const authorName = post.author?.name || 'Tendinuri Sherpa';
  const authorTitle = post.author?.title || 'Full Stack Developer';
  const authorAvatar = post.author?.avatar || '/default-avatar.jpg';

  // FIX: Listen to both events - headingsReady and headingInView
  useEffect(() => {
    if (toc.length === 0) return;

    const handleHeadingsReady = () => {
      console.log('Sidebar: Headings ready');
      setHeadingsReady(true);
    };

    const handleHeadingInView = (e: CustomEvent) => {
      const { activeId } = e.detail;
      setActiveId(activeId);
    };

    window.addEventListener('headingsReady', handleHeadingsReady);
    window.addEventListener('headingInView', handleHeadingInView as EventListener);

    // Fallback: Check if headings exist after a short delay
    const checkTimer = setTimeout(() => {
      if (toc[0]?.id) {
        const element = document.getElementById(toc[0].id);
        if (element) {
          setHeadingsReady(true);
          setActiveId(toc[0].id);
        }
      }
    }, 500);

    return () => {
      window.removeEventListener('headingsReady', handleHeadingsReady);
      window.removeEventListener('headingInView', handleHeadingInView as EventListener);
      clearTimeout(checkTimer);
    };
  }, [toc]);

  // Smooth scroll to heading
  const handleTocClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
      setActiveId(id);
    }
  }, []);

  const handleShare = (platform: string) => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };

    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  return (
    <div className="sticky top-8 space-y-8">
      <Link href="/blog" className="inline-flex items-center gap-2 text-grey-600 hover:text-red">
        <ArrowLeft className="w-4 h-4" />
        Back to Blog
      </Link>

      {toc.length > 0 && (
        <div className="bg-grey-100 rounded-xl p-6">
          <h3 className="font-bold text-grey-900 mb-4">Table of Contents</h3>
          <nav className="space-y-2">
            {toc.map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleTocClick(e, item.id)}
                  className={`block text-sm transition-all duration-200 cursor-pointer border-l-2 pl-3 py-1 ${
                    isActive
                      ? 'border-red text-red font-medium bg-red/5'
                      : 'border-transparent text-grey-600 hover:text-grey-900 hover:bg-grey-200/50'
                  } ${item.level === 1 ? '' : 'pl-6'}`}
                >
                  {item.text}
                </a>
              );
            })}
          </nav>
        </div>
      )}

      {/* Share Section */}
      <div className="bg-grey-100 rounded-xl p-6">
        <h3 className="font-bold text-grey-900 mb-4 flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => handleShare('twitter')}
            className="p-3 bg-white rounded-lg hover:bg-grey-200 transition-colors"
          >
            <Twitter className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="p-3 bg-white rounded-lg hover:bg-grey-200 transition-colors"
          >
            <Linkedin className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="p-3 bg-white rounded-lg hover:bg-grey-200 transition-colors"
          >
            <Facebook className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tags Section */}
      <div className="bg-grey-100 rounded-xl p-6">
        <h3 className="font-bold text-grey-900 mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {post.tags?.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              className="px-3 py-1 bg-white text-grey-600 text-sm rounded-full hover:bg-red hover:text-white transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Author Section */}
      <div className="bg-grey-100 rounded-xl p-6">
        <h3 className="font-bold text-grey-900 mb-4">About Author</h3>
        <div className="flex items-center gap-3">
          {authorAvatar ? (
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-grey-200 shrink-0">
              <Image
                src={authorAvatar}
                alt={authorName}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-red/10 rounded-full flex items-center justify-center shrink-0">
              <span className="text-red font-bold text-lg">
                {authorName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-grey-900">{authorName}</p>
            {authorTitle && <p className="text-sm text-grey-600">{authorTitle}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
