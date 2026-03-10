'use client';

import { useEffect, useRef, useState } from 'react';
import { BlogPost } from '@/lib/types/models';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative group mb-6">
      <pre className="bg-grey-900 text-grey-100 p-4 rounded-xl overflow-x-auto">
        <code className="text-sm block">{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-grey-800/80 text-grey-200 opacity-0 group-hover:opacity-100 hover:bg-grey-700 transition-all duration-200"
        aria-label={copied ? 'Copied!' : 'Copy code'}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
      {language && (
        <span className="absolute bottom-3 right-3 text-xs text-grey-500 uppercase">
          {language}
        </span>
      )}
    </div>
  );
}

interface BlogPostContentProps {
  post: BlogPost;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Add IDs immediately after mount
  useEffect(() => {
    const addIds = () => {
      if (!contentRef.current) {
        console.log('Content ref not available');
        return;
      }

      const toc = post.toc || [];
      if (toc.length === 0) {
        console.log('No TOC');
        return;
      }

      const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
      console.log('Content: Found headings:', headings.length);

      if (headings.length === 0) {
        // Retry after a short delay
        setTimeout(addIds, 50);
        return;
      }

      const tocMap = new Map<string, string>();
      toc.forEach((item) => {
        tocMap.set(item.text.toLowerCase().trim(), item.id);
      });

      let matched = 0;

      headings.forEach((heading) => {
        const text = heading.textContent?.trim() || '';
        const textLower = text.toLowerCase();

        let id = tocMap.get(textLower);

        if (!id) {
          const normalizedText = textLower.replace(/[^a-z0-9\s]/g, '').trim();
          for (const [tocText, tocId] of tocMap) {
            const normalizedToc = tocText.replace(/[^a-z0-9\s]/g, '').trim();
            if (normalizedText === normalizedToc) {
              id = tocId;
              break;
            }
          }
        }

        if (!id) {
          id = textLower
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        } else {
          matched++;
        }

        if (id) {
          heading.id = id;
        }
      });

      console.log('Content: Matched', matched, 'headings, dispatching event');

      // Dispatch event after IDs are added
      window.dispatchEvent(
        new CustomEvent('headingsReady', {
          detail: { count: matched, total: headings.length },
        }),
      );
    };

    // Run immediately and after a short delay to be safe
    addIds();
    const timer = setTimeout(addIds, 100);

    return () => clearTimeout(timer);
  }, [post.toc, post.contentHtml]);

  // Render content
  const renderContent = () => {
    if (!post.contentHtml) return null;

    const hasCodeBlocks = post.contentHtml.includes('<pre><code');

    if (!hasCodeBlocks) {
      return <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />;
    }

    const parts = post.contentHtml.split(/(<pre><code[^>]*>[\s\S]*?<\/code><\/pre>)/g);

    return parts.map((part, index) => {
      if (part.startsWith('<pre><code')) {
        const codeMatch = part.match(/<code[^>]*>([\s\S]*?)<\/code>/);
        const code = codeMatch
          ? codeMatch[1]
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#x27;/g, "'")
              .replace(/&#x2F;/g, '/')
          : '';

        const langMatch = part.match(/class="language-(\w+)"/);
        const language = langMatch ? langMatch[1] : undefined;

        return <CodeBlock key={index} code={code} language={language} />;
      }

      return <div key={index} dangerouslySetInnerHTML={{ __html: part }} />;
    });
  };

  return (
    <article ref={contentRef}>
      {post.coverImage && (
        <div className="relative w-full aspect-[16/9] mb-8 rounded-xl overflow-hidden">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="blog-content">{renderContent()}</div>
    </article>
  );
}
