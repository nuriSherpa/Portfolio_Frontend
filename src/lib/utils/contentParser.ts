// No React imports - pure TypeScript logic
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
 * Parse HTML content into code and text parts
 */
export function parseContent(html: string): ParsedContent {
  const hasCodeBlocks = html.includes('<pre><code');

  if (!hasCodeBlocks) {
    return {
      parts: [{ type: 'html', content: html }],
      hasCodeBlocks: false,
    };
  }

  const rawParts = html.split(/(<pre><code[^>]*>[\s\S]*?<\/code><\/pre>)/g);

  const parts: ContentPart[] = rawParts
    .filter((part) => part.trim())
    .map((part) => {
      if (part.startsWith('<pre><code')) {
        return parseCodeBlock(part);
      }
      return { type: 'html', content: part };
    });

  return { parts, hasCodeBlocks };
}

/**
 * Extract code and language from a code block HTML string
 */
export function parseCodeBlock(html: string): ContentPart {
  const codeMatch = html.match(/<code[^>]*>([\s\S]*?)<\/code>/);
  const code = codeMatch ? decodeHtmlEntities(codeMatch[1]) : '';

  const langMatch = html.match(/class="language-(\w+)"/);
  const language = langMatch ? langMatch[1] : undefined;

  return { type: 'code', content: code, language };
}

/**
 * Decode HTML entities back to characters
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
 * Split HTML content by headings for ad insertion points
 */
export function splitByHeadings(html: string, minBlocks: number): string[] {
  // Match h2 and h3 tags as natural break points
  const splitRegex = /(<h[2-3][^>]*>[\s\S]*?<\/h[2-3]>)/g;
  const sections = html.split(splitRegex).filter(Boolean);

  if (sections.length <= 1) {
    return [html];
  }

  // Group sections to respect minimum block count
  const result: string[] = [];
  let currentGroup = '';
  let blockCount = 0;

  sections.forEach((section) => {
    currentGroup += section;
    blockCount++;

    if (blockCount >= minBlocks && result.length === 0) {
      result.push(currentGroup);
      currentGroup = '';
      blockCount = 0;
    }
  });

  if (currentGroup) {
    result.push(currentGroup);
  }

  return result.length > 0 ? result : [html];
}

/**
 * Map language aliases to Prism language names
 */
export function normalizeLanguage(lang?: string): string {
  if (!lang) return 'text';

  const aliases: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    sh: 'bash',
    shell: 'bash',
    dockerfile: 'docker',
    yml: 'yaml',
    md: 'markdown',
    jsx: 'jsx',
    tsx: 'tsx',
  };

  return aliases[lang.toLowerCase()] || lang.toLowerCase();
}
