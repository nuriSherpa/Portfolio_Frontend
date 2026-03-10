'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { BlogPost } from '@/lib/types/models';
import { ArrowLeft, Share2, Twitter, Linkedin, Facebook } from 'lucide-react';

interface BlogPostSidebarProps {
  post: BlogPost;
}

export function BlogPostSidebar({ post }: BlogPostSidebarProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [headingsReady, setHeadingsReady] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : post.canonicalUrl || '';
  const shareText = `Check out "${post.title}" by ${post.author?.name || 'Author'}`;

  const toc = post.toc || [];

  // Listen for headings ready and also poll as fallback
  useEffect(() => {
    if (toc.length === 0) return;

    let pollInterval: NodeJS.Timeout | null = null;

    const handleHeadingsReady = () => {
      console.log('Sidebar: Event received');
      setHeadingsReady(true);
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    window.addEventListener('headingsReady', handleHeadingsReady);

    // Fallback: poll for headings
    const checkHeadings = () => {
      const firstId = toc[0]?.id;
      if (!firstId) return false;

      const element = document.getElementById(firstId);
      if (element) {
        console.log('Sidebar: Found headings via polling');
        setHeadingsReady(true);
        return true;
      }
      return false;
    };

    // Try immediately
    if (!checkHeadings()) {
      // Start polling every 100ms for up to 3 seconds
      let attempts = 0;
      pollInterval = setInterval(() => {
        attempts++;
        if (checkHeadings() || attempts > 30) {
          if (pollInterval) clearInterval(pollInterval);
        }
      }, 100);
    }

    return () => {
      window.removeEventListener('headingsReady', handleHeadingsReady);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [toc]);

  // Scroll spy
  useEffect(() => {
    if (!headingsReady || toc.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      let current: string | null = null;

      for (const item of toc) {
        const element = document.getElementById(item.id);
        if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) {
            current = item.id;
          }
        }
      }

      setActiveId(current);
    };

    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headingsReady, toc]);

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

      {/* Share, Tags, Author sections... */}
      <div className="bg-grey-100 rounded-xl p-6">
        <h3 className="font-bold text-grey-900 mb-4 flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => handleShare('twitter')}
            className="p-3 bg-white rounded-lg hover:bg-grey-200"
          >
            <Twitter className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="p-3 bg-white rounded-lg hover:bg-grey-200"
          >
            <Linkedin className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="p-3 bg-white rounded-lg hover:bg-grey-200"
          >
            <Facebook className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-grey-100 rounded-xl p-6">
        <h3 className="font-bold text-grey-900 mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {post.tags?.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              className="px-3 py-1 bg-white text-grey-600 text-sm rounded-full hover:bg-red hover:text-white"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {post.author && (
        <div className="bg-grey-100 rounded-xl p-6">
          <h3 className="font-bold text-grey-900 mb-4">About Author</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red/10 rounded-full flex items-center justify-center">
              <span className="text-red font-bold text-lg">
                {post.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-grey-900">{post.author.name}</p>
              {post.author.title && <p className="text-sm text-grey-600">{post.author.title}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
