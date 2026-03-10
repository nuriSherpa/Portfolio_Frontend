import { Metadata } from 'next';
import { Suspense } from 'react';
import { getPosts } from '@/lib/api/actions/posts';
import { BlogGrid } from '@/components/blog/blog-grid';
import { BlogPageSkeleton } from '@/components/blog/blog-page-skeleton';

export const metadata: Metadata = {
  title: 'Blog | Portfolio',
  description: 'Explore my latest articles, tutorials, and thoughts on development',
};

export const revalidate = 3600;

async function BlogContent() {
  console.log('[Server] Fetching posts...');
  const { posts, meta, filters } = await getPosts(6, 1);
  console.log(`[Server] Got ${posts.length} posts`);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-red mb-2">Blog</h1>
        <p className="text-lg text-grey-600 max-w-2xl">
          Thoughts, tutorials, and insights about web development, design, and technology.
        </p>
      </div>
      <BlogGrid initialPosts={posts} initialMeta={meta} initialFilters={filters} limit={6} />
    </>
  );
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="w-[80%] mx-auto">
        <Suspense fallback={<BlogPageSkeleton />}>
          <BlogContent />
        </Suspense>
      </div>
    </main>
  );
}
