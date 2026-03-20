'use client';

import React, { useEffect, useRef } from 'react';
import { BlogPost } from '@/lib/types/models';
import { Check, Copy } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import Image from 'next/image';

import { AdContainer, useAdInsertion } from './AdContainer';
import {
  parseContent,
  splitByHeadings,
  normalizeLanguage,
  ContentPart,
} from '../../lib/utils/contentParser';

// Import Prism languages
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

// --- Components ---

interface CodeBlockProps {
  code: string;
  language?: string;
}

function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current && language && Prism.languages[language]) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const prismLang = normalizeLanguage(language);

  return (
    <div className="relative group mb-6">
      <pre className="bg-grey-900 text-grey-100 p-4 rounded-xl overflow-x-auto">
        <code ref={codeRef} className={`language-${prismLang} text-sm block`}>
          {code}
        </code>
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

// --- Main Component ---

interface BlogPostContentProps {
  post: BlogPost;
  enableAds?: boolean;
  adFrequency?: number;
}

export function BlogPostContent({
  post,
  enableAds = false,
  adFrequency = 4,
}: BlogPostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRefs = useRef<Map<string, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { shouldShowAd, getNextAdIndex } = useAdInsertion({ enableAds, adFrequency });

  // Use featuredImage with fallback to firstImage or coverImage
  const imageUrl = post.featuredImage || post.firstImage || post.coverImage;
  const imageAlt = post.featuredImageAlt || post.title;

  // FIX 1: Working scroll spy with IntersectionObserver
  useEffect(() => {
    if (!post.toc || post.toc.length === 0 || !contentRef.current) return;

    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Collect heading elements
    const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headingRefs.current.clear();

    // Map TOC items to heading elements and assign IDs
    const tocMap = new Map(post.toc.map((item) => [item.text.toLowerCase().trim(), item.id]));

    headings.forEach((heading) => {
      const text = heading.textContent?.trim() || '';
      const textLower = text.toLowerCase();

      // Find matching TOC ID
      let id = tocMap.get(textLower) || tocMap.get(textLower.replace(/[^a-z0-9\s]/g, '').trim());

      if (!id) {
        // Generate ID if not in TOC
        id = textLower
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }

      if (id) {
        heading.id = id;
        headingRefs.current.set(id, heading as HTMLElement);
      }
    });

    // Create IntersectionObserver for scroll spy
    // FIX: Use rootMargin to create a "middle zone" for activation [^1^][^5^]
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the last intersecting entry (bottom-most visible heading)
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            const rectA = a.boundingClientRect;
            const rectB = b.boundingClientRect;
            return rectA.top - rectB.top;
          });

        if (visibleEntries.length > 0) {
          // Get the last (most bottom) visible heading
          const activeEntry = visibleEntries[visibleEntries.length - 1];
          const activeId = activeEntry.target.id;

          // Dispatch custom event for sidebar
          window.dispatchEvent(
            new CustomEvent('headingInView', {
              detail: { activeId },
            }),
          );
        }
      },
      {
        root: null, // viewport
        rootMargin: '-20% 0px -60% 0px', // Activate when heading is in top 20-40% of viewport
        threshold: 0,
      },
    );

    // Observe all headings
    headingRefs.current.forEach((heading) => {
      observerRef.current?.observe(heading);
    });

    // Initial dispatch
    if (headingRefs.current.size > 0) {
      const firstId = post.toc[0]?.id;
      if (firstId) {
        window.dispatchEvent(new CustomEvent('headingsReady', { detail: {} }));
      }
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [post.toc, post.contentHtml]);

  // Render content with dynamic ads
  const renderContent = (): React.ReactNode[] => {
    if (!post.contentHtml) return [];

    const { parts, hasCodeBlocks } = parseContent(post.contentHtml);
    const elements: React.ReactNode[] = [];
    let blockCount = 0;

    parts.forEach((part, index) => {
      if (part.type === 'code') {
        elements.push(
          <CodeBlock key={`code-${index}`} code={part.content} language={part.language} />,
        );
        blockCount++;

        if (shouldShowAd(blockCount)) {
          elements.push(
            <AdContainer
              key={`ad-${getNextAdIndex()}`}
              position="inline"
              index={blockCount / adFrequency - 1}
            />,
          );
        }
      } else {
        const remaining = adFrequency - (blockCount % adFrequency);
        const sections = hasCodeBlocks ? splitByHeadings(part.content, remaining) : [part.content];

        sections.forEach((section, secIndex) => {
          if (section.trim()) {
            elements.push(
              <div
                key={`html-${index}-${secIndex}`}
                dangerouslySetInnerHTML={{ __html: section }}
              />,
            );
            blockCount++;

            if (shouldShowAd(blockCount) && secIndex < sections.length - 1) {
              elements.push(
                <AdContainer
                  key={`ad-${getNextAdIndex()}`}
                  position="between-sections"
                  index={blockCount / adFrequency - 1}
                />,
              );
            }
          }
        });
      }
    });

    return elements;
  };

  return (
    <article ref={contentRef} className="relative">
      {/* FIX 2: No orange background - use empty placeholder or no placeholder */}
      {imageUrl && (
        <div className="relative w-full aspect-[16/9] mb-8 rounded-xl overflow-hidden bg-grey-100">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
            // FIX: Remove placeholder="blur" or use placeholder="empty" to avoid orange blur [^3^][^4^]
            placeholder="empty"
            // Alternative: If you want blur, provide a proper blurDataURL:
            // placeholder="blur"
            // blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%23f3f4f6'/%3E%3C/svg%3E"
          />
        </div>
      )}

      <div className="blog-content">{renderContent()}</div>
    </article>
  );
}
