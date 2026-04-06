'use client';

// src/components/blog/blog-post-content.tsx
// NOTE ON PRISM: Kept intentionally. The rich text editor outputs
// <pre><code class="language-x"> blocks and Prism gives us syntax
// highlighting + the copy button for free. No markdown lib needed.

import React, { useEffect, useRef } from 'react';
import { BlogPost } from '@/lib/types/models';
import { Check, Copy } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import Image from 'next/image';

import {
  parseContent,
  splitByHeadings,
  normalizeLanguage,
  ContentPart,
} from '../../lib/utils/contentParser';

// Prism language support
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

// ─────────────────────────────────────────────────────────────────────────────
// AD SYSTEM NOTE:
// When you're ready to add ads, replace the comment blocks below marked
// [AD SLOT] with your ad component, e.g.:
//   import { AdUnit } from '@/components/ads/AdUnit';
//   <AdUnit slot="in-article" index={i} />
//
// The splitByHeadings() function already creates natural break points
// between h2/h3 sections — those are the best places for in-article ads.
// Code blocks also make good post-ad positions (reader pauses to read code).
// ─────────────────────────────────────────────────────────────────────────────

// ── Code Block ───────────────────────────────────────────────────────────────

interface CodeBlockProps {
  code: string;
  language?: string;
}

function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const prismLang = normalizeLanguage(language);

  useEffect(() => {
    if (codeRef.current && Prism.languages[prismLang]) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, prismLang]);

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
      <pre className="bg-[var(--color-black)] text-white p-4 rounded-xl overflow-x-auto">
        <code ref={codeRef} className={`language-${prismLang} text-sm block`}>
          {code}
        </code>
      </pre>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all duration-200"
        aria-label={copied ? 'Copied!' : 'Copy code'}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>

      {/* Language badge */}
      {language && (
        <span className="absolute bottom-3 right-3 text-xs text-white/40 uppercase tracking-wide">
          {language}
        </span>
      )}

      {/* [AD SLOT] — good position after code blocks (reader natural pause)
          Uncomment when ad system is ready:
          {showAdAfterCode && <AdUnit slot="post-code" />}
      */}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface BlogPostContentProps {
  post: BlogPost;
  // AD SYSTEM: keep these props for future use
  enableAds?: boolean;
  adFrequency?: number; // every N sections
}

export function BlogPostContent({
  post,
  enableAds = false, // AD SYSTEM: flip to true when ready
  adFrequency = 4,
}: BlogPostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRefs = useRef<Map<string, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Featured image: prefer featuredImage, fall back to firstImage
  // (firstImage is the first <img> found inside content HTML)
  const imageUrl = post.featuredImage || post.firstImage;
  const imageAlt = post.featuredImageAlt || post.title;

  // ── Scroll spy ─────────────────────────────────────────────────────────────
  // Dispatches a 'headingInView' CustomEvent that BlogPostSidebar listens to.
  // The backend already injects id="" attributes into headings via addHeadingIds().
  useEffect(() => {
    if (!post.toc?.length || !contentRef.current) return;

    observerRef.current?.disconnect();

    const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4');
    headingRefs.current.clear();

    // Build a text → id map from the TOC
    const tocMap = new Map(post.toc.map((item) => [item.text.toLowerCase().trim(), item.id]));

    headings.forEach((heading) => {
      const text = heading.textContent?.trim() ?? '';
      let id =
        tocMap.get(text.toLowerCase()) ??
        tocMap.get(
          text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .trim(),
        );

      // Fallback: generate id if not in TOC (shouldn't happen with new backend)
      if (!id) {
        id = text
          .toLowerCase()
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

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const activeId = visible[visible.length - 1].target.id;
          window.dispatchEvent(new CustomEvent('headingInView', { detail: { activeId } }));
        }
      },
      { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );

    headingRefs.current.forEach((el) => observerRef.current?.observe(el));

    if (post.toc[0]?.id) {
      window.dispatchEvent(new CustomEvent('headingsReady', { detail: {} }));
    }

    return () => observerRef.current?.disconnect();
  }, [post.toc, post.content]);

  // ── Render content ──────────────────────────────────────────────────────────
  const renderContent = (): React.ReactNode[] => {
    // `content` is the canonical HTML field from the backend
    if (!post.content) return [];

    const { parts, hasCodeBlocks } = parseContent(post.content);
    const elements: React.ReactNode[] = [];
    let blockCount = 0;

    parts.forEach((part, index) => {
      if (part.type === 'code') {
        elements.push(
          <CodeBlock key={`code-${index}`} code={part.content} language={part.language} />,
        );
        blockCount++;

        // [AD SLOT] — after code blocks
        // if (enableAds && blockCount % adFrequency === 0) {
        //   elements.push(<AdUnit key={`ad-code-${blockCount}`} slot="post-code" />);
        // }
      } else {
        // Split HTML sections at h2/h3 boundaries for ad insertion points
        const sections = hasCodeBlocks
          ? splitByHeadings(part.content, adFrequency - (blockCount % adFrequency))
          : [part.content];

        sections.forEach((section, secIndex) => {
          if (!section.trim()) return;

          elements.push(
            <div
              key={`html-${index}-${secIndex}`}
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: section }}
            />,
          );
          blockCount++;

          // [AD SLOT] — between content sections (best placement for in-article ads)
          // Insert after every `adFrequency` blocks, but not after the last section
          // if (enableAds && blockCount % adFrequency === 0 && secIndex < sections.length - 1) {
          //   elements.push(<AdUnit key={`ad-section-${blockCount}`} slot="in-article" />);
          // }
        });
      }
    });

    return elements;
  };

  return (
    <article ref={contentRef} className="relative">
      {/* Featured / hero image */}
      {imageUrl && (
        <div className="relative w-full aspect-[16/9] mb-8 rounded-xl overflow-hidden bg-grey-100">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
            placeholder="empty"
          />
        </div>
      )}

      {/* [AD SLOT] — above content (high visibility, use sparingly)
          if (enableAds) <AdUnit slot="above-content" />
      */}

      {/* Content */}
      <div>{renderContent()}</div>

      {/* [AD SLOT] — below content (good for "read more" / related ads)
          if (enableAds) <AdUnit slot="below-content" />
      */}
    </article>
  );
}
