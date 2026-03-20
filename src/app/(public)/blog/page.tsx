// src/app/(public)/blog/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import { getPosts } from '@/lib/api/actions/blog';
import { BlogGrid } from '@/components/blog/blog-grid';
import { BlogSearch } from '@/components/blog/blog-search';
import { BlogFilters } from '@/components/blog/blog-filters';
import { BlogPageSkeleton } from '@/components/blog/blog-page-skeleton';

export const metadata: Metadata = {
  title: 'Blog | Portfolio',
  description: 'Explore my latest articles, tutorials, and thoughts on development',
};

export const revalidate = 3600;

// Updated interface - searchParams is now a Promise
interface BlogPageProps {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    category?: string;
    sort?: string;
    page?: string;
    author?: string;
    fromDate?: string;
    toDate?: string;
    minReadingTime?: string;
    maxReadingTime?: string;
    dateRange?: string;
  }>;
}

async function BlogContent({ searchParams }: BlogPageProps) {
  // Await the searchParams Promise
  const params = await searchParams;

  // Parse URL params
  const query = params.q || '';
  const tag = params.tag || '';
  const category = params.category || '';
  const sort = params.sort || 'newest';
  const page = parseInt(params.page || '1', 10);
  const author = params.author || '';
  const fromDate = params.fromDate || '';
  const toDate = params.toDate || '';
  const minReadingTime = params.minReadingTime || '';
  const maxReadingTime = params.maxReadingTime || '';

  // Use searchPosts if any filter is applied, otherwise use getPosts
  const hasAdvancedFilters =
    query || category || author || fromDate || toDate || minReadingTime || maxReadingTime;

  let posts, meta, filters;

  if (hasAdvancedFilters) {
    // Import searchPosts dynamically or use it directly
    const { searchPosts } = await import('@/lib/api/actions/blog');
    const result = await searchPosts(query, {
      tag: tag || undefined,
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
    filters = result.filters;
  } else {
    const result = await getPosts(6, page, tag || undefined, sort, category || undefined);
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

      <div className="mb-6 flex flex-col gap-4">
        <BlogSearch />
        <BlogFilters initialFilters={filters} />
      </div>

      <BlogGrid initialPosts={posts} initialMeta={meta} initialFilters={filters} limit={6} />
    </>
  );
}

function BlogGridWrapper({ searchParams }: BlogPageProps) {
  return (
    <Suspense fallback={<BlogPageSkeleton />}>
      <BlogContent searchParams={searchParams} />
    </Suspense>
  );
}

// Updated page component - must await searchParams
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    category?: string;
    sort?: string;
    page?: string;
    author?: string;
    fromDate?: string;
    toDate?: string;
    minReadingTime?: string;
    maxReadingTime?: string;
    dateRange?: string;
  }>;
}) {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="w-[80%] mx-auto">
        <BlogGridWrapper searchParams={searchParams} />
      </div>
    </main>
  );
}
