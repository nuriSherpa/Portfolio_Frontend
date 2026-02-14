class FrontendRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly limits: Map<string, { max: number; window: number }> = new Map();

  constructor() {
    this.limits.set('default', { max: 10, window: 60000 });
    this.limits.set('hero', { max: 5, window: 60000 });
    this.limits.set('visitor', { max: 3, window: 60000 });
    this.limits.set('search', { max: 10, window: 60000 });
  }

  canProceed(key: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const limit = this.limits.get(key) || this.limits.get('default')!;
    let timestamps = this.requests.get(key) || [];
    timestamps = timestamps.filter((time) => now - time < limit.window);

    if (timestamps.length < limit.max) {
      timestamps.push(now);
      this.requests.set(key, timestamps);
      return { allowed: true };
    }

    const oldestRequest = timestamps[0];
    const retryAfter = Math.ceil((oldestRequest + limit.window - now) / 1000);
    return { allowed: false, retryAfter };
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

export const rateLimiter = new FrontendRateLimiter();
