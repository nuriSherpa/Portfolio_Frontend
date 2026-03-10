import { BlogPost } from '@/lib/types/models';
import { Calendar, Clock, User, Eye } from 'lucide-react';

interface BlogPostHeaderProps {
  post: BlogPost;
}

export function BlogPostHeader({ post }: BlogPostHeaderProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isUpdated = post.lastUpdatedAt && post.lastUpdatedAt !== post.publishedAt;

  return (
    <header className="mb-8">
      {/* Category & Tags */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="px-3 py-1 bg-red text-white text-sm font-medium rounded-full">
          {post.category}
        </span>
        {post.tags?.slice(0, 3).map((tag) => (
          <span key={tag} className="px-3 py-1 bg-grey-100 text-grey-600 text-sm rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-grey-900 mb-6 leading-tight">
        {post.title}
      </h1>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-grey-600 mb-8 pb-8 border-b border-grey-200">
        {post.author && (
          <div className="flex items-center gap-3">
            {/* Avatar - using fallback for now */}
            <div className="w-10 h-10 bg-red/10 rounded-full flex items-center justify-center">
              <span className="text-red font-bold text-lg">
                {post.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-grey-900">{post.author.name}</p>
              {post.author.title && <p className="text-xs text-grey-600">{post.author.title}</p>}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{formattedDate}</span>
          {isUpdated && (
            <span className="text-xs text-grey-400">
              (Updated: {new Date(post.lastUpdatedAt!).toLocaleDateString()})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{post.readingTime || post.readTime} min read</span>
        </div>

        {post.views !== undefined && (
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{post.views} views</span>
          </div>
        )}
      </div>
    </header>
  );
}
