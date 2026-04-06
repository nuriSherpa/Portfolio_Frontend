'use client';

// src/components/blog/blog-tags.tsx
import { motion } from 'framer-motion';

interface Tag {
  name: string;
  count: number;
}

interface BlogTagsProps {
  tags: Tag[];
  activeTag: string | null;
  onTagClick: (tag: string | null) => void;
}

export function BlogTags({ tags, activeTag, onTagClick }: BlogTagsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* "All Posts" pill */}
      <button
        onClick={() => onTagClick(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          activeTag === null
            ? 'bg-[var(--color-red)] text-[var(--color-white)] shadow-md'
            : 'bg-grey-100 text-grey-600 hover:bg-grey-200'
        }`}
      >
        All Posts
      </button>

      {tags.map((tag) => {
        const isActive = activeTag === tag.name;
        return (
          <motion.button
            key={tag.name}
            onClick={() => onTagClick(tag.name)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              isActive
                ? 'bg-[var(--color-red)] text-[var(--color-white)] shadow-md'
                : 'bg-grey-100 text-grey-600 hover:bg-grey-200'
            }`}
          >
            #{tag.name}
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                isActive
                  ? 'bg-[var(--color-white)]/20 text-[var(--color-white)]'
                  : 'bg-grey-200 text-grey-500'
              }`}
            >
              {tag.count}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
