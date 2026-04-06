// src/components/blog/blog-search.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAutocompleteSuggestions } from '@/lib/api/actions/blog';

interface Suggestion {
  type: string;
  id: string;
  title: string;
  slug: string;
  category?: string;
  tags: string[];
  views: number;
  rank: number;
}

export function BlogSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setTotalResults(0);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const result = await getAutocompleteSuggestions(q.trim(), 5);
      const items = Array.isArray(result.suggestions) ? result.suggestions : [];
      const valid = items.filter(
        (s: any) =>
          s && typeof s.title === 'string' && s.title.length > 0 && typeof s.slug === 'string',
      ) as Suggestion[];
      setSuggestions(valid);
      setTotalResults(result.total || valid.length);
      // Always open when we get results
      if (valid.length > 0) setIsOpen(true);
    } catch {
      setSuggestions([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      setTotalResults(0);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  // Click outside using ref — not class selector
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const buildUrl = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) params.set('q', q.trim());
    else params.delete('q');
    params.delete('page');
    return `/blog?${params.toString()}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedIndex(-1);
    if (val.trim().length >= 2) setIsOpen(true);
    else {
      setIsOpen(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (s: Suggestion) => {
    setIsOpen(false);
    setQuery('');
    setSuggestions([]);
    router.push(`/blog/${s.slug}`);
  };

  const handleFullSearch = () => {
    if (!query.trim()) return;
    setIsOpen(false);
    setSuggestions([]);
    router.push(buildUrl(query));
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setTotalResults(0);
    setIsOpen(false);
    router.push(buildUrl(''));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((p) => Math.min(p + 1, suggestions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((p) => Math.max(p - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length)
        handleSuggestionClick(suggestions[selectedIndex]);
      else handleFullSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const highlightMatch = (text: string, q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return <>{text}</>;
    try {
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
      return (
        <>
          {parts.map((part, i) =>
            part.toLowerCase() === trimmed.toLowerCase() ? (
              <mark key={i} className="bg-red/20 text-red font-semibold rounded px-0.5 not-italic">
                {part}
              </mark>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </>
      );
    } catch {
      return <>{text}</>;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder="Search articles by title or tags..."
          className="w-full pl-12 pr-12 py-3 bg-white border border-grey-200 rounded-xl focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20 transition-all"
          autoComplete="off"
        />
        {isLoading ? (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-400 animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 text-grey-400 hover:text-grey-600"
          >
            <X className="w-5 h-5" />
          </button>
        ) : null}
      </div>

      {/* Dropdown */}
      {isOpen && (isLoading || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-grey-200 rounded-xl shadow-xl overflow-hidden z-50">
          {isLoading && suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-grey-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </div>
          ) : (
            <div className="py-1">
              {suggestions.map((s, index) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-4 py-3 text-left transition-colors border-b border-grey-50 last:border-0 ${
                    selectedIndex === index ? 'bg-grey-50' : 'hover:bg-grey-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-grey-100 text-grey-500 text-[10px] font-bold rounded flex items-center justify-center mt-0.5">
                      {s.rank || index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-grey-900 text-sm leading-snug">
                        {highlightMatch(s.title, query)}
                      </p>
                      {Array.isArray(s.tags) && s.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {s.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                                tag.toLowerCase().includes(query.toLowerCase())
                                  ? 'bg-red/10 text-red'
                                  : 'bg-grey-100 text-grey-500'
                              }`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-grey-400">
                        {s.category && <span>{s.category}</span>}
                        {typeof s.views === 'number' && s.views > 0 && (
                          <>
                            <span>·</span>
                            <span>{s.views.toLocaleString()} views</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {/* See all results */}
              {query.trim().length >= 2 && (
                <button
                  type="button"
                  onClick={handleFullSearch}
                  onMouseEnter={() => setSelectedIndex(suggestions.length)}
                  className={`w-full px-4 py-2.5 text-left border-t border-grey-100 transition-colors ${
                    selectedIndex === suggestions.length ? 'bg-grey-50' : 'hover:bg-grey-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-grey-600">
                      Search for &quot;{query}&quot;
                    </span>
                    <span className="text-xs text-grey-400">Enter ↵</span>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
