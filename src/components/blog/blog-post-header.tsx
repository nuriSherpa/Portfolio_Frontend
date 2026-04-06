// src/components/blog/blog-post-header.tsx
import { BlogPost } from '@/lib/types/models';
import { Calendar, Clock, Eye } from 'lucide-react';

interface BlogPostHeaderProps {
  post: BlogPost;
}

export function BlogPostHeader({ post }: BlogPostHeaderProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Show "Updated" only if lastUpdatedAt exists and differs from publishedAt
  const isUpdated =
    post.lastUpdatedAt &&
    new Date(post.lastUpdatedAt).toDateString() !== new Date(post.publishedAt).toDateString();

  return (
    <header className="mb-8">
      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-black)] mb-6 leading-tight">
        {post.title}
      </h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-grey-600 pb-8 border-b border-grey-200">
        {/* Published date */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--color-red)]" />
          <span>{formattedDate}</span>
          {isUpdated && (
            <span className="text-xs text-grey-400">
              (Updated:{' '}
              {new Date(post.lastUpdatedAt!).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
              )
            </span>
          )}
        </div>

        {/* Reading time — `readingTime` is the canonical field from the new backend */}
        {post.readingTime != null && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--color-red)]" />
            <span>{post.readingTime} min read</span>
          </div>
        )}

        {/* Views */}
        {post.views != null && (
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[var(--color-red)]" />
            <span>{post.views.toLocaleString()} views</span>
          </div>
        )}
      </div>
    </header>
  );
}
