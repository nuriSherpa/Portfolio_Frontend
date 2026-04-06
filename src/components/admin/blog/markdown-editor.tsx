// src/app/(cms-portal)/components/blog/markdown-editor.tsx
'use client';

import { useState } from 'react';
import { Eye, Code } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  // Simple markdown preview (you can use a library like react-markdown for better preview)
  const renderPreview = () => {
    // Basic markdown to HTML conversion for preview
    let html = value
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
      .replace(
        /```([\s\S]*?)```/gim,
        '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>',
      )
      .replace(/\n/gim, '<br />');

    return { __html: html };
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Markdown supported</span>
          <span className="text-gray-300">|</span>
          <span className="text-xs"># H1 ## H2 ### H3 **bold** *italic* `code`</span>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
        >
          {showPreview ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor / Preview */}
      <div className="min-h-[400px]">
        {showPreview ? (
          <div
            className="p-4 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={renderPreview()}
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-[400px] p-4 font-mono text-sm resize-none focus:outline-none"
            placeholder="# Write your post here...

## Introduction

Start with a compelling introduction...

## Main Content

Use markdown formatting:
- **Bold text** for emphasis
- *Italic* for style
- `code` for inline code
- ``` for code blocks

## Conclusion

Wrap up your thoughts..."
          />
        )}
      </div>
    </div>
  );
}
