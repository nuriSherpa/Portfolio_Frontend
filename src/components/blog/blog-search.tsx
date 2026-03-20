// src/components/blog/blog-search.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAutocompleteSuggestions } from '@/lib/api/actions/blog';

interface Suggestion {
  type: 'post';
  id: string;
  title: string;
  slug: string;
  category?: string;
  tags: string[];
  views: number;
  excerpt?: string;
  rank: number;
}

export function BlogSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setTotalResults(0);
      return;
    }
    setIsLoading(true);
    try {
      const result = await getAutocompleteSuggestions(searchQuery, 5);

      // Filter out suggestions with invalid data
      const validSuggestions = (result.suggestions || []).filter(
        (s): s is Suggestion =>
          s &&
          typeof s === 'object' &&
          typeof s.title === 'string' &&
          s.title.length > 0 &&
          typeof s.slug === 'string',
      );

      setSuggestions(validSuggestions);
      setTotalResults(result.total || 0);
    } catch {
      setSuggestions([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  // Keep input in sync if URL q param changes externally
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const buildUrl = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) params.set('q', q.trim());
    else params.delete('q');
    params.delete('page');
    return `/blog?${params.toString()}`;
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/blog/${suggestion.slug}`);
  };

  const handleFullSearch = () => {
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(buildUrl(query));
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setTotalResults(0);
    router.push(buildUrl(''));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        handleFullSearch();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.search-container')) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // FIXED: Added null/undefined check for text
  const highlightMatch = (text: string | null | undefined, q: string) => {
    // Guard against undefined/null/empty text
    if (!text || typeof text !== 'string') {
      return text || '';
    }

    if (!q || typeof q !== 'string') {
      return text;
    }

    const trimmedQuery = q.trim();
    if (trimmedQuery.length === 0) {
      return text;
    }

    try {
      const escaped = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');

      // Split and map with proper key handling
      const parts = text.split(regex);

      return parts.map((part, i) => {
        // Check if this part matches the query (case insensitive)
        if (part.toLowerCase() === trimmedQuery.toLowerCase()) {
          return (
            <mark key={`${i}-${part}`} className="bg-red/20 text-red font-semibold rounded px-0.5">
              {part}
            </mark>
          );
        }
        return <span key={`${i}-${part}`}>{part}</span>;
      });
    } catch (e) {
      // Fallback if regex fails
      console.error('Highlight error:', e);
      return text;
    }
  };

  return (
    <div className="search-container relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search articles by title or tags..."
          className="w-full pl-12 pr-12 py-3 bg-white border border-grey-200 rounded-xl focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20 transition-all"
        />
        {isLoading ? (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-400 animate-spin" />
        ) : query ? (
          <button onClick={handleClear} className="absolute right-4 top-1/2 -translate-y-1/2">
            <X className="w-5 h-5 text-grey-400 hover:text-grey-600" />
          </button>
        ) : null}
      </div>

      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-grey-200 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.slug || suggestion.id || index}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-4 py-3 text-left transition-colors border-b border-grey-50 last:border-0 ${
                  selectedIndex === index ? 'bg-grey-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-grey-100 text-grey-600 text-xs font-bold rounded flex items-center justify-center mt-0.5">
                    {suggestion.rank || index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    {/* FIXED: Ensure title exists before highlighting */}
                    <div className="font-medium text-grey-900 text-sm">
                      {suggestion.title ? highlightMatch(suggestion.title, query) : 'Untitled'}
                    </div>

                    {/* Tags with null check */}
                    {Array.isArray(suggestion.tags) && suggestion.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {suggestion.tags.slice(0, 4).map((tag, tagIndex) => (
                          <span
                            key={`${tag}-${tagIndex}`}
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              tag && tag.toLowerCase().includes(query.toLowerCase())
                                ? 'bg-red/10 text-red font-medium'
                                : 'bg-grey-100 text-grey-500'
                            }`}
                          >
                            #{tag || 'untitled'}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta info with null checks */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-grey-400">
                      {suggestion.category && <span>{suggestion.category}</span>}
                      {typeof suggestion.views === 'number' && suggestion.views > 0 && (
                        <>
                          <span>•</span>
                          <span>{suggestion.views.toLocaleString()} views</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {totalResults > suggestions.length && (
              <button
                onClick={handleFullSearch}
                onMouseEnter={() => setSelectedIndex(suggestions.length)}
                className={`w-full px-4 py-3 text-left border-t border-grey-200 bg-grey-50 hover:bg-grey-100 transition-colors ${
                  selectedIndex === suggestions.length ? 'bg-grey-100' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-grey-700">
                    Show all {totalResults} results
                  </span>
                  <span className="text-xs text-grey-500">Press Enter ↵</span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
