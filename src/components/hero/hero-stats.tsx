'use client';

import { Users, Box, ThumbsUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toggleLike, PublicStats, LIKED_KEY } from '@/lib/api/actions/stats';
import { useStats } from '@/hooks/use-stats';
import { ScrollingNumber } from './scrolling-number';

interface HeroStatsProps {
  serverStats: PublicStats;
}

export function HeroStats({ serverStats }: HeroStatsProps) {
  console.log('[HeroStats] serverStats received:', serverStats);

  const { stats, prevStats, changedFields, isLiked, setIsLiked, updateStats } =
    useStats(serverStats);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLike = async () => {
    if (isLiked || isLikeLoading) return;

    setIsLiked(true);
    setIsLikeLoading(true);

    try {
      const result = await toggleLike();
      if (result.liked) {
        updateStats({ likes: stats.likes + 1 });
        localStorage.setItem(LIKED_KEY, 'true');
      } else if (result.alreadyLiked) {
        localStorage.setItem(LIKED_KEY, 'true');
      }
    } catch (err) {
      console.error('Like failed:', err);
      setIsLiked(false);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const shouldAnimate = (field: keyof PublicStats) => mounted && changedFields.has(field);

  return (
    <div className="flex justify-center gap-8 lg:gap-12">
      <div className="flex items-center gap-3">
        <Users size={20} className="text-grey-600" />
        <div>
          <div className="text-2xl font-bold text-black tabular-nums leading-none">
            <ScrollingNumber
              value={stats.visitors}
              prevValue={prevStats.visitors}
              animate={shouldAnimate('visitors')}
            />
          </div>
          <div className="text-sm text-grey-500 mt-1">Visitors</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Box size={20} className="text-grey-600" />
        <div>
          <div className="text-2xl font-bold text-black tabular-nums leading-none">
            <ScrollingNumber
              value={stats.projects}
              prevValue={prevStats.projects}
              animate={shouldAnimate('projects')}
            />
          </div>
          <div className="text-sm text-grey-500 mt-1">Projects</div>
        </div>
      </div>

      <button
        onClick={handleLike}
        disabled={isLiked || isLikeLoading}
        className="flex items-center gap-3 group cursor-pointer select-none focus:outline-none disabled:cursor-default"
        aria-label={isLiked ? 'Liked' : 'Like'}
      >
        <ThumbsUp
          size={20}
          className={`transition-all duration-100 ${
            isLiked ? 'text-red ' : 'text-grey-600 group-hover:text-red'
          }`}
        />
        <div>
          <div
            className={`text-2xl font-bold tabular-nums leading-none transition-colors duration-200 ${
              isLiked ? 'text-red' : 'text-black'
            }`}
          >
            <ScrollingNumber
              value={stats.likes}
              prevValue={prevStats.likes}
              animate={shouldAnimate('likes')}
            />
          </div>
          <div className="text-sm text-grey-500 mt-1">Likes</div>
        </div>
      </button>
    </div>
  );
}
