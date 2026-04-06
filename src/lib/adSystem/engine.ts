import { AdConfig, AdImpression, AdClick, AdEvent, AdProvider } from './types';
import { adInventory, adSystemConfig } from './config';

class AdEngine {
  private sessionId: string;
  private shownAds: Set<string> = new Set();
  private impressionQueue: AdImpression[] = [];
  private clickQueue: AdClick[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Select best ad based on targeting, weight, and priority
  selectAd(
    position: string,
    category: string,
    contentLength: number,
    index: number,
    excludeAds: string[] = [],
  ): AdConfig | null {
    if (!adSystemConfig.enabled) return null;

    // Filter eligible ads
    let eligible = adInventory.filter((ad) => {
      if (!ad.enabled) return false;
      if (excludeAds.includes(ad.id)) return false;
      if (this.shownAds.has(ad.id) && ad.provider !== 'adsense') return false; // Don't repeat internal ads

      // Check targeting
      if (ad.targeting) {
        if (ad.targeting.positions && !ad.targeting.positions.includes(position as any))
          return false;
        if (
          ad.targeting.categories &&
          !ad.targeting.categories.includes('all') &&
          !ad.targeting.categories.includes(category)
        )
          return false;
        if (ad.targeting.minContentLength && contentLength < ad.targeting.minContentLength)
          return false;
      }

      // Check schedule
      if (ad.schedule) {
        const now = new Date();
        if (ad.schedule.startDate && now < new Date(ad.schedule.startDate)) return false;
        if (ad.schedule.endDate && now > new Date(ad.schedule.endDate)) return false;
        if (ad.schedule.daysOfWeek && !ad.schedule.daysOfWeek.includes(now.getDay())) return false;
        if (ad.schedule.hoursOfDay && !ad.schedule.hoursOfDay.includes(now.getHours()))
          return false;
      }

      return true;
    });

    if (eligible.length === 0) {
      // Fallback to any enabled internal ad
      // eligible = adInventory.filter(
      //   // (ad) => ad.enabled && ad.provider === adSystemConfig.fallbackProvider,
      // );
    }

    if (eligible.length === 0) return null;

    // Sort by priority, then weight
    eligible.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.weight - a.weight;
    });

    // Weighted random selection
    const totalWeight = eligible.reduce((sum, ad) => sum + ad.weight, 0);
    let random = Math.random() * totalWeight;

    for (const ad of eligible) {
      random -= ad.weight;
      if (random <= 0) {
        this.shownAds.add(ad.id);
        return ad;
      }
    }

    return eligible[0];
  }

  // Track impression
  trackImpression(data: Omit<AdImpression, 'sessionId' | 'timestamp'>): void {
    const impression: AdImpression = {
      ...data,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };

    this.impressionQueue.push(impression);

    // Real-time tracking for high-value ads
    if (this.isHighValue(data.provider)) {
      this.flushImpressions();
    }
  }

  // Track click
  trackClick(data: Omit<AdClick, 'sessionId' | 'timestamp'>): void {
    const click: AdClick = {
      ...data,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };

    this.clickQueue.push(click);
    this.flushClicks(); // Clicks are always sent immediately
  }

  private isHighValue(provider: AdProvider): boolean {
    return provider === 'adsense' || provider === 'ezoic';
  }

  private startFlushTimer(): void {
    // Flush every 30 seconds
    setInterval(() => {
      this.flushImpressions();
    }, 30000);
  }

  private async flushImpressions(): Promise<void> {
    if (this.impressionQueue.length === 0) return;

    const batch = [...this.impressionQueue];
    this.impressionQueue = [];

    try {
      await fetch('/api/analytics/ad/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch, type: 'impression' }),
      });
    } catch (e) {
      // Re-queue failed impressions
      this.impressionQueue.unshift(...batch);
    }
  }

  private async flushClicks(): Promise<void> {
    if (this.clickQueue.length === 0) return;

    const batch = [...this.clickQueue];
    this.clickQueue = [];

    try {
      await fetch('/api/analytics/ad/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch, type: 'click' }),
      });
    } catch (e) {
      console.error('Failed to track clicks:', e);
    }
  }

  // Get analytics for admin dashboard
  async getStats(days: number = 30): Promise<{
    impressions: number;
    clicks: number;
    ctr: number;
    revenue: number;
    topAds: { id: string; name: string; impressions: number; clicks: number }[];
  }> {
    const res = await fetch(`/api/analytics/ad/stats?days=${days}`);
    return res.json();
  }

  reset(): void {
    this.shownAds.clear();
  }
}

export const adEngine = new AdEngine();
