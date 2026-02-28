// src/components/hero/hero-stats.tsx
'use client';

import { Users, Box, ThumbsUp } from 'lucide-react';
import { useState, useEffect } from 'react';

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

interface HeroStatsProps {
  visitorCount: number;
  projectCount: number;
  likeCount: number;
}

export function HeroStats({ visitorCount, projectCount, likeCount }: HeroStatsProps) {
  const [likes, setLikes] = useState(likeCount);
  const [isLiked, setIsLiked] = useState(false);
  const [likeBump, setLikeBump] = useState(false);

  // Load liked status from localStorage on mount
  useEffect(() => {
    const savedLiked = localStorage.getItem('heroLiked');
    const savedLikes = localStorage.getItem('heroLikes');

    if (savedLiked !== null) {
      setIsLiked(JSON.parse(savedLiked));
    }

    if (savedLikes !== null) {
      setLikes(JSON.parse(savedLikes));
    }
  }, []);

  const handleLike = () => {
    // Bump effect
    setLikeBump(true);
    setTimeout(() => setLikeBump(false), 200);

    // Update like status
    const newLiked = !isLiked;
    const newLikes = newLiked ? likes + 1 : likes - 1;

    setIsLiked(newLiked);
    setLikes(newLikes);

    // Save to localStorage
    localStorage.setItem('heroLiked', JSON.stringify(newLiked));
    localStorage.setItem('heroLikes', JSON.stringify(newLikes));
  };

  return (
    <div className="flex justify-center gap-8 lg:gap-12">
      {/* Visitors - Static */}
      <div className="flex items-center gap-3">
        <Users size={20} className="text-grey-600" />
        <div>
          <div className="text-2xl font-bold text-black tabular-nums">
            {formatNumber(visitorCount)}
          </div>
          <div className="text-sm text-grey-500">Visitors</div>
        </div>
      </div>

      {/* Projects - Static */}
      <div className="flex items-center gap-3">
        <Box size={20} className="text-grey-600" />
        <div>
          <div className="text-2xl font-bold text-black tabular-nums">
            {formatNumber(projectCount)}
          </div>
          <div className="text-sm text-grey-500">Projects</div>
        </div>
      </div>

      {/* Likes - Interactive with bump effect and persistence */}
      <button
        onClick={handleLike}
        className="flex items-center gap-3 group cursor-pointer select-none focus:outline-none"
        aria-label={isLiked ? 'Unlike' : 'Like'}
      >
        <div className={`transition-transform duration-200 ${likeBump ? 'scale-110' : ''}`}>
          <ThumbsUp
            size={20}
            className={`transition-all duration-200 ${
              isLiked ? 'text-red' : 'text-grey-600 group-hover:text-red'
            }`}
          />
        </div>
        <div>
          <div
            className={`text-2xl font-bold tabular-nums transition-colors duration-200 ${
              isLiked ? 'text-red' : 'text-black'
            }`}
          >
            {formatNumber(likes)}
          </div>
          <div className="text-sm text-grey-500">Likes</div>
        </div>
      </button>
    </div>
  );
}
