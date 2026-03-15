'use client';

import React, { useEffect, useState } from 'react';
import { AdConfig } from '@/lib/adSystem/types';
import { adEngine } from '@/lib/adSystem/engine';
import { AdRenderer } from './AdRenderer';

interface AdContainerProps {
  position: 'inline' | 'between-sections' | 'top' | 'bottom';
  index: number;
  contentSlug: string;
  category: string;
  contentLength: number;
  excludeAds?: string[];
}

export function AdContainer({
  position,
  index,
  contentSlug,
  category,
  contentLength,
  excludeAds = [],
}: AdContainerProps) {
  const [ad, setAd] = useState<AdConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Select ad using engine
    const selected = adEngine.selectAd(position, category, contentLength, index, excludeAds);

    setAd(selected);
    setLoading(false);
  }, [position, index, category, contentLength, excludeAds]);

  if (loading) {
    return (
      <div className="my-8 p-6 bg-grey-800/30 rounded-xl animate-pulse">
        <div className="h-4 bg-grey-700 rounded w-1/3 mb-3" />
        <div className="h-20 bg-grey-700 rounded" />
      </div>
    );
  }

  if (!ad) return null;

  return (
    <div className="my-8" data-ad-id={ad.id} data-ad-provider={ad.provider}>
      {/* Debug in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-[10px] text-grey-600 mb-1 font-mono">
          [{ad.provider}] {ad.name} • {position} • weight:{ad.weight}
        </div>
      )}

      <AdRenderer config={ad} position={position} contentSlug={contentSlug} category={category} />
    </div>
  );
}

// Hook for ad insertion logic
export function useAdInsertion(enableAds: boolean, frequency: number, maxAds: number = 5) {
  const adCountRef = React.useRef(0);
  const blockCountRef = React.useRef(0);

  const shouldShowAd = (blockCount: number): boolean => {
    if (!enableAds) return false;
    if (adCountRef.current >= maxAds) return false;

    blockCountRef.current = blockCount;
    const shouldShow = blockCount > 0 && blockCount % frequency === 0;

    if (shouldShow) {
      adCountRef.current++;
    }

    return shouldShow;
  };

  const getAdIndex = () => adCountRef.current - 1;

  const resetAds = () => {
    adCountRef.current = 0;
    blockCountRef.current = 0;
    adEngine.reset();
  };

  return {
    shouldShowAd,
    getAdIndex,
    resetAds,
    adCount: adCountRef.current,
  };
}
