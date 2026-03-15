import { AdConfig } from './types';

// Your ad inventory - edit this to add/remove ads
export const adInventory: AdConfig[] = [
  // Internal Ad 1: Your own product
  {
    id: 'internal-docker-course',
    provider: 'internal',
    name: 'Docker Masterclass',
    weight: 30,
    priority: 10,
    enabled: true,
    targeting: {
      categories: ['docker', 'devops', 'backend'],
      positions: ['inline', 'between-sections'],
    },
    settings: {
      title: 'Docker Masterclass',
      description: 'From zero to production-ready containers. 10+ hours of hands-on tutorials.',
      imageUrl: '/ads/docker-course.png',
      linkUrl: 'https://yourdomain.com/courses/docker',
      sponsorName: 'YourBrand Academy',
      ctaText: 'Start Learning',
      bgColor: '#2563eb',
    },
    analytics: {
      impressionUrl: '/api/analytics/ad/impression',
      clickUrl: '/api/analytics/ad/click',
    },
  },

  // Internal Ad 2: Newsletter
  {
    id: 'internal-newsletter',
    provider: 'internal',
    name: 'Weekly Dev Tips',
    weight: 20,
    priority: 5,
    enabled: true,
    targeting: {
      positions: ['between-sections', 'bottom'],
    },
    settings: {
      title: 'Weekly Dev Tips',
      description: 'Get 5-minute coding tips every Tuesday. Join 50,000+ developers.',
      imageUrl: '/ads/newsletter.png',
      linkUrl: 'https://yourdomain.com/newsletter',
      sponsorName: 'YourBrand',
      ctaText: 'Subscribe Free',
      bgColor: '#10b981',
    },
  },

  // Google AdSense 1
  {
    id: 'adsense-in-article',
    provider: 'adsense',
    name: 'AdSense In-Article',
    weight: 25,
    priority: 3,
    enabled: true,
    targeting: {
      categories: ['all'],
      positions: ['inline'],
    },
    settings: {
      clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '',
      slotId: '1234567890',
      format: 'fluid',
    },
  },

  // Google AdSense 2
  {
    id: 'adsense-display',
    provider: 'adsense',
    name: 'AdSense Display',
    weight: 15,
    priority: 3,
    enabled: true,
    targeting: {
      positions: ['between-sections'],
    },
    settings: {
      clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '',
      slotId: '0987654321',
      format: 'auto',
    },
  },

  // Carbon Ads (developer focused)
  {
    id: 'carbon-dev',
    provider: 'carbon',
    name: 'Carbon Developer Ads',
    weight: 10,
    priority: 2,
    enabled: false, // Enable when you have Carbon account
    targeting: {
      categories: ['javascript', 'typescript', 'react', 'nextjs'],
      positions: ['inline'],
    },
    settings: {
      serveId: 'YOUR_CARBON_SERVE_ID',
      placement: 'YOUR_PLACEMENT',
    },
  },

  // Sponsor Ad (direct sold)
  {
    id: 'sponsor-vercel',
    provider: 'internal',
    name: 'Vercel Partnership',
    weight: 40, // High weight for direct sponsor
    priority: 10,
    enabled: true,
    schedule: {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    },
    targeting: {
      categories: ['nextjs', 'deployment', 'frontend'],
      positions: ['top', 'inline'],
    },
    settings: {
      title: 'Deploy with Vercel',
      description: 'The platform for frontend developers. Deploy Next.js in seconds.',
      imageUrl: '/sponsors/vercel.svg',
      linkUrl: 'https://vercel.com',
      sponsorName: 'Vercel',
      ctaText: 'Deploy Now',
      bgColor: '#000000',
    },
  },
];

// Global settings
export const adSystemConfig = {
  enabled: true,
  maxAdsPerArticle: 5,
  minContentBlocksForAds: 3,
  adFrequency: 4, // Every N blocks
  viewabilityThreshold: 0.5, // 50% visible = impression
  respectDNT: true, // Do Not Track
  respectConsent: true, // GDPR/CCPA consent required
  fallbackProvider: 'internal' as AdProvider,
};
