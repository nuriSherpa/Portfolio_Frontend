// src/lib/utils/contentParser.ts
// Pure TypeScript — no external dependencies needed.
// Works with the `content` field which is already processed HTML from the backend.

export interface ContentPart {
  type: 'code' | 'html';
  content: string;
  language?: string;
}

export interface ParsedContent {
  parts: ContentPart[];
  hasCodeBlocks: boolean;
}

/**
 * Parse HTML content into code blocks and plain HTML parts.
 * The rich text editor outputs standard <pre><code class="language-x"> blocks
 * so we split on those to render them with Prism syntax highlighting.
 */
export function parseContent(html: string): ParsedContent {
  if (!html) return { parts: [], hasCodeBlocks: false };

  const hasCodeBlocks = /<pre[^>]*><code[^>]*>/.test(html);

  if (!hasCodeBlocks) {
    return {
      parts: [{ type: 'html', content: html }],
      hasCodeBlocks: false,
    };
  }

  // Split on <pre><code ...>...</code></pre> blocks, keeping them in the array
  const rawParts = html.split(/(<pre[^>]*><code[^>]*>[\s\S]*?<\/code><\/pre>)/g);

  const parts: ContentPart[] = rawParts
    .filter((part) => part.trim())
    .map((part) => {
      if (/^<pre[^>]*><code/.test(part)) {
        return parseCodeBlock(part);
      }
      return { type: 'html', content: part };
    });

  return { parts, hasCodeBlocks };
}

/**
 * Extract raw code text and language from a <pre><code> block.
 * Decodes HTML entities so Prism receives clean source code.
 */
export function parseCodeBlock(html: string): ContentPart {
  const codeMatch = html.match(/<code[^>]*>([\s\S]*?)<\/code>/);
  const code = codeMatch ? decodeHtmlEntities(codeMatch[1]) : '';

  // Supports both class="language-x" and data-language="x"
  const langMatch =
    html.match(/class="[^"]*language-(\w+)[^"]*"/) || html.match(/data-language="(\w+)"/);
  const language = langMatch ? langMatch[1] : undefined;

  return { type: 'code', content: code, language };
}

/**
 * Decode HTML entities back to characters.
 * Needed because the browser/backend escapes code block content.
 */
export function decodeHtmlEntities(html: string): string {
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/**
 * Split an HTML string at h2/h3 boundaries to create natural ad insertion points.
 * `minBlocks` controls how many sections must accumulate before the first split.
 *
 * AD SYSTEM NOTE:
 * This is the primary hook for injecting ads between content sections.
 * Each returned string is one "block" — render an <AdUnit> between blocks.
 * When you integrate an ad network, wrap the caller site like:
 *
 *   sections.map((section, i) => (
 *     <>
 *       <div dangerouslySetInnerHTML={{ __html: section }} />
 *       {i < sections.length - 1 && <AdUnit slot="in-article" />}
 *     </>
 *   ))
 */
export function splitByHeadings(html: string, minBlocks: number): string[] {
  const splitRegex = /(<h[2-3][^>]*>[\s\S]*?<\/h[2-3]>)/g;
  const sections = html.split(splitRegex).filter(Boolean);

  if (sections.length <= 1) return [html];

  const result: string[] = [];
  let currentGroup = '';
  let blockCount = 0;

  for (const section of sections) {
    currentGroup += section;
    blockCount++;

    if (blockCount >= minBlocks && result.length === 0) {
      result.push(currentGroup);
      currentGroup = '';
      blockCount = 0;
    }
  }

  if (currentGroup) result.push(currentGroup);

  return result.length > 0 ? result : [html];
}

/**
 * Map common language aliases to Prism's registered language names.
 */
export function normalizeLanguage(lang?: string): string {
  if (!lang) return 'text';

  const aliases: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    sh: 'bash',
    shell: 'bash',
    zsh: 'bash',
    dockerfile: 'docker',
    yml: 'yaml',
    md: 'markdown',
    jsx: 'jsx',
    tsx: 'tsx',
    html: 'markup',
    xml: 'markup',
    svg: 'markup',
  };

  return aliases[lang.toLowerCase()] ?? lang.toLowerCase();
}
