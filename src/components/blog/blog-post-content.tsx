'use client';

import React, { useEffect, useRef } from 'react';
import { BlogPost } from '@/lib/types/models';
import { Check, Copy } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

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
  const idsAssignedRef = useRef(false);
  const { shouldShowAd, getNextAdIndex } = useAdInsertion({ enableAds, adFrequency });

  // Heading ID injection for TOC
  useEffect(() => {
    let retryTimer: NodeJS.Timeout | undefined;

    const addIds = () => {
      if (!contentRef.current || idsAssignedRef.current) return;
      if (!post.toc || post.toc.length === 0) return;

      const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length === 0) {
        retryTimer = setTimeout(addIds, 50);
        return;
      }

      const tocMap = new Map(post.toc.map((item) => [item.text.toLowerCase().trim(), item.id]));
      let matched = 0;

      headings.forEach((heading) => {
        const text = heading.textContent?.trim() || '';
        const textLower = text.toLowerCase();

        let id = tocMap.get(textLower) || tocMap.get(textLower.replace(/[^a-z0-9\s]/g, '').trim());

        if (!id) {
          id = textLower
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        } else {
          matched++;
        }

        if (id) heading.id = id;
      });

      idsAssignedRef.current = true;
      window.dispatchEvent(
        new CustomEvent('headingsReady', {
          detail: { count: matched, total: headings.length },
        }),
      );
    };

    addIds();
    const safetyTimer = setTimeout(addIds, 100);

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      clearTimeout(safetyTimer);
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
        // Render code block
        elements.push(
          <CodeBlock key={`code-${index}`} code={part.content} language={part.language} />,
        );
        blockCount++;

        // Check for ad insertion after code
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
        // Render HTML content, possibly split by headings
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

            // Check for ad insertion between sections
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
      {post.coverImage && (
        <div className="relative w-full aspect-[16/9] mb-8 rounded-xl overflow-hidden">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="blog-content">{renderContent()}</div>
    </article>
  );
}
