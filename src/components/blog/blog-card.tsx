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

  return (
    <article className="group bg-white border border-grey-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link href={`/blog/${post.slug}`} className="flex flex-col md:flex-row">
        {/* Image Left */}
        <div className="relative w-full md:w-2/5 lg:w-1/3 aspect-[16/10] md:aspect-auto md:min-h-[280px] overflow-hidden bg-grey-100">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red/10 to-red/5 flex items-center justify-center">
              <span className="text-red/30 text-6xl font-bold">B</span>
            </div>
          )}
        </div>

        {/* Text Right */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
          <div>
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs text-grey-500 bg-grey-50 px-2 py-1 rounded-md">
                  #{tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-grey-400">+{post.tags.length - 3}</span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-bold text-grey-900 mb-3 group-hover:text-red transition-colors line-clamp-2">
              {post.title}
            </h2>

            {/* Excerpt */}
            <p className="text-grey-600 text-sm md:text-base line-clamp-2 md:line-clamp-3 mb-4">
              {post.excerpt}
            </p>
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between pt-4 border-t border-grey-100">
            <div className="flex items-center gap-4 text-sm text-grey-500 flex-wrap">
              {post.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium text-grey-700">{post.author.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime} min read</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 text-red font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
              Read More
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
