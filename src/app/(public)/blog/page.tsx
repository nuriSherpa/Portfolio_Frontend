// src/app/(public)/blog/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import { getPosts, searchPosts } from '@/lib/api/actions/blog';
import { BlogGrid } from '@/components/blog/blog-grid';
import { BlogSearch } from '@/components/blog/blog-search';
import { BlogFilters } from '@/components/blog/blog-filters';
import { BlogPageSkeleton } from '@/components/blog/blog-page-skeleton';

export const metadata: Metadata = {
  title: 'Blog | Portfolio',
  description: 'Explore my latest articles, tutorials, and thoughts on development',
};

export const revalidate = 3600;

interface SearchParams {
  q?: string;
  tags?: string;
  category?: string;
  sort?: string;
  page?: string;
  author?: string;
  fromDate?: string;
  toDate?: string;
  minReadingTime?: string;
  maxReadingTime?: string;
  dateRange?: string;
}

async function BlogContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  const query = params.q || '';
  const tags = params.tags || '';
  const category = params.category || '';
  const sort = params.sort || 'newest';
  const page = parseInt(params.page || '1', 10);
  const author = params.author || '';
  const fromDate = params.fromDate || '';
  const toDate = params.toDate || '';
  const minReadingTime = params.minReadingTime || '';
  const maxReadingTime = params.maxReadingTime || '';

  const hasFilters = !!(
    query ||
    category ||
    author ||
    fromDate ||
    toDate ||
    minReadingTime ||
    maxReadingTime ||
    tags
  );

  let posts, meta, filters;

  if (hasFilters) {
    const activeTag = tags ? tags.split(',')[0] : '';
    const result = await searchPosts(query, {
      tags: tags || undefined,
      tag: activeTag || undefined,
      category: category || undefined,
      author: author || undefined,
      sort,
      page,
      limit: 6,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      minReadingTime: minReadingTime ? parseInt(minReadingTime) : undefined,
      maxReadingTime: maxReadingTime ? parseInt(maxReadingTime) : undefined,
    });
    posts = result.posts;
    meta = result.meta;
    // Search endpoint doesn't return filters — use a fresh getPosts call for filters
    // so category/tag pills always show, even on filtered pages
    const filtersResult = await getPosts(1, 1);
    filters = filtersResult.filters;
  } else {
    // Clean load — getPosts returns both posts AND filters in one call
    const result = await getPosts(6, page, undefined, sort, undefined);
    posts = result.posts;
    meta = result.meta;
    filters = result.filters;
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-red mb-2">Blog</h1>
        <p className="text-lg text-grey-600 max-w-2xl">
          Thoughts, tutorials, and insights about web development, design, and technology.
        </p>
      </div>

      <div className="mb-4">
        <BlogSearch />
      </div>

      <div className="mb-6">
        <BlogFilters initialFilters={filters} />
      </div>

      <BlogGrid initialPosts={posts} initialMeta={meta} initialFilters={filters} limit={6} />
    </>
  );
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="w-[80%] mx-auto">
        <Suspense fallback={<BlogPageSkeleton />}>
          <BlogContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
