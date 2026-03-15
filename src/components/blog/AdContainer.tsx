'use client';

import React from 'react';

export interface AdContainerProps {
  position: 'inline' | 'between-sections' | 'top' | 'bottom';
  index: number;
  className?: string;
  // Future ad network props
  adSlot?: string;
  adFormat?: 'auto' | 'rectangle' | 'leaderboard';
}

export function AdContainer({
  position,
  index,
  className = '',
  adSlot,
  adFormat = 'auto',
}: AdContainerProps) {
  return (
    <div
      className={`
        my-8 p-6 bg-grey-800/30 border border-dashed border-grey-600 rounded-xl 
        text-center min-h-[120px] flex flex-col items-center justify-center gap-2
        ${className}
      `}
      data-ad-position={position}
      data-ad-index={index}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
    >
      <span className="text-grey-500 text-xs uppercase tracking-wider font-medium">
        {position === 'inline' ? 'Sponsored' : 'Advertisement'}
      </span>
      <span className="text-grey-600 text-sm">
        Ad Space {index + 1} • {position}
      </span>
      {/* TODO: Replace with actual ad component */}
      {/* <GoogleAd slot={adSlot || `ad-${position}-${index}`} format={adFormat} /> */}
    </div>
  );
}

// Hook for ad insertion logic
export interface UseAdInsertionProps {
  enableAds: boolean;
  adFrequency: number;
}

export interface AdInsertionResult {
  shouldShowAd: (blockCount: number) => boolean;
  getNextAdIndex: () => number;
  resetCounter: () => void;
}

export function useAdInsertion({ enableAds, adFrequency }: UseAdInsertionProps): AdInsertionResult {
  const adIndexRef = React.useRef(0);
  const blockCountRef = React.useRef(0);

  const shouldShowAd = (blockCount: number): boolean => {
    if (!enableAds) return false;
    blockCountRef.current = blockCount;
    return blockCount > 0 && blockCount % adFrequency === 0;
  };

  const getNextAdIndex = (): number => {
    const current = adIndexRef.current;
    adIndexRef.current += 1;
    return current;
  };

  const resetCounter = (): void => {
    adIndexRef.current = 0;
    blockCountRef.current = 0;
  };

  return {
    shouldShowAd,
    getNextAdIndex,
    resetCounter,
  };
}
