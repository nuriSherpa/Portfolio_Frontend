import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/api/actions/posts';
import { BlogPostContent } from '@/components/blog/blog-post-content';
import { BlogPostSidebar } from '@/components/blog/blog-post-sidebar';
import { BlogPostHeader } from '@/components/blog/blog-post-header';
import { ScrollToTopButton } from '@/components/shared/scroll-to-top-button';

interface BlogPostPageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  // Handle both async and sync params (Next.js 15+)
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found | Blog',
    };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.tags?.join(', '),
    alternates: {
      canonical: post.canonicalUrl,
    },
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.lastUpdatedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      tags: post.tags,
    },
  };
}

// Main page component - MUST be default export
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Handle both async and sync params
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white py-12">
      <div className="w-[80%] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <BlogPostHeader post={post} />
            <BlogPostContent post={post} />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <BlogPostSidebar post={post} />
          </aside>
        </div>
        <ScrollToTopButton />
      </div>
    </main>
  );
}
