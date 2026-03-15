// Core ad types
export type AdProvider = 'internal' | 'adsense' | 'carbon' | 'ezoic' | 'custom-script';

export interface AdConfig {
  id: string;
  provider: AdProvider;
  name: string;
  weight: number; // 0-100, probability of showing
  targeting?: {
    categories?: string[];
    positions?: ('inline' | 'between-sections' | 'top' | 'bottom')[];
    minContentLength?: number;
    excludeTags?: string[];
  };
  // Provider-specific settings
  settings: {
    // Google AdSense
    clientId?: string;
    slotId?: string;
    format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
    // Carbon/Ezoic
    serveId?: string;
    placement?: string;
    // Internal/Custom
    title?: string;
    description?: string;
    imageUrl?: string;
    linkUrl?: string;
    sponsorName?: string;
    ctaText?: string;
    bgColor?: string;
    // Custom script
    scriptUrl?: string;
    containerId?: string;
  };
  // Scheduling
  schedule?: {
    startDate?: string;
    endDate?: string;
    daysOfWeek?: number[]; // 0-6
    hoursOfDay?: number[]; // 0-23
  };
  // Analytics
  analytics?: {
    impressionUrl?: string;
    clickUrl?: string;
    conversionUrl?: string;
  };
  // Status
  enabled: boolean;
  priority: number; // Higher = more important
}

export interface AdImpression {
  adId: string;
  provider: AdProvider;
  position: string;
  contentSlug: string;
  category: string;
  userAgent: string;
  referrer: string;
  timestamp: string;
  sessionId: string;
  geo?: {
    country?: string;
    city?: string;
  };
  device?: {
    type: 'mobile' | 'tablet' | 'desktop';
    os?: string;
    browser?: string;
  };
}

export interface AdClick extends AdImpression {
  clickX: number;
  clickY: number;
  destinationUrl: string;
}

export type AdEvent = 'impression' | 'click' | 'viewable' | 'conversion';
