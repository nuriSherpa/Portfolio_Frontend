'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/lib/types/models';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Use featuredImage (from upload) with fallback to firstImage or coverImage
  const imageUrl = post.featuredImage || post.coverImage || post.firstImage;

  // Author data with fallbacks
  const authorName = post.author?.name || 'Tendinuri Sherpa';
  const authorTitle = post.author?.title || 'Full Stack Developer';
  const authorAvatar = post.author?.avatar || '/default-avatar.jpg';

  // Reading time (handle both readingTime and readTime)
  const readTime = post.readingTime || post.readTime || 5;

  return (
    <article className="group bg-white border border-grey-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link href={`/blog/${post.slug}`} className="flex flex-col md:flex-row">
        {/* 
          MOBILE: Image on top (full width)
          DESKTOP: Image on left (2/5 width)
        */}
        <div className="relative w-full md:w-2/5 lg:w-1/3 aspect-[16/9] md:aspect-auto md:min-h-[280px] overflow-hidden bg-grey-100 shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={post.featuredImageAlt || post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 40vw"
              priority={false}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red/10 to-red/5 flex items-center justify-center">
              <span className="text-red/30 text-6xl font-bold">
                {post.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 md:p-8 flex flex-col justify-between">
          <div>
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-grey-500 bg-grey-50 px-2 py-1 rounded-md uppercase tracking-wide"
                >
                  #{tag}
                </span>
              ))}
              {post.tags && post.tags.length > 3 && (
                <span className="text-xs text-grey-400 bg-grey-50 px-2 py-1 rounded-md">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-bold text-grey-900 mb-3 group-hover:text-red transition-colors line-clamp-2 leading-tight">
              {post.title}
            </h2>

            {/* Excerpt */}
            <p className="text-grey-600 text-sm md:text-base line-clamp-2 md:line-clamp-3 mb-4 leading-relaxed">
              {post.excerpt || 'No excerpt available'}
            </p>
          </div>

          {/* Meta Info - Author, Date, Reading Time */}
          <div className="flex flex-col gap-3 pt-4 border-t border-grey-100">
            {/* Author Row */}
            <div className="flex items-center gap-3">
              {authorAvatar && (
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-grey-200 shrink-0">
                  <Image
                    src={authorAvatar}
                    alt={authorName}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-grey-900 leading-tight">
                  {authorName}
                </span>
                {authorTitle && (
                  <span className="text-xs text-grey-500 leading-tight">{authorTitle}</span>
                )}
              </div>
            </div>

            {/* Date & Reading Time Row */}
            <div className="flex items-center gap-4 text-xs md:text-sm text-grey-500 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{readTime} min read</span>
              </div>
            </div>

            {/* Read More - Desktop only */}
            <div className="hidden md:flex items-center gap-2 text-red font-medium text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 mt-2">
              Read Article
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
