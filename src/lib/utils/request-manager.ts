// Track in-flight requests to prevent duplicates
const pendingRequests = new Map<string, AbortController>();
const requestHistory = new Map<string, number>(); // url -> timestamp

// Debounce config
const DEBOUNCE_MS = 300; // Wait 300ms before sending
const REFRESH_COOLDOWN_MS = 2000; // 2 seconds between refreshes

interface RequestConfig {
  url: string;
  method?: string;
  skipDebounce?: boolean;
}

export function createRequestKey(config: RequestConfig): string {
  return `${config.method || 'GET'}:${config.url}`;
}

// Check if we should block this request (refresh spam)
export function shouldBlockRequest(url: string): boolean {
  const now = Date.now();
  const lastRequest = requestHistory.get(url);

  if (lastRequest && now - lastRequest < REFRESH_COOLDOWN_MS) {
    console.log(`[RequestManager] Blocked: ${url} (refresh cooldown)`);
    return true;
  }

  requestHistory.set(url, now);
  return false;
}

// Debounce requests
export function debounceRequest<T>(
  key: string,
  fn: () => Promise<T>,
  waitMs: number = DEBOUNCE_MS,
): Promise<T> {
  // Cancel previous pending request
  const existing = pendingRequests.get(key);
  if (existing) {
    existing.abort();
    pendingRequests.delete(key);
  }

  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    pendingRequests.set(key, controller);

    const timeout = setTimeout(async () => {
      if (controller.signal.aborted) {
        reject(new Error('Request cancelled'));
        return;
      }

      try {
        const result = await fn();
        pendingRequests.delete(key);
        resolve(result);
      } catch (err) {
        pendingRequests.delete(key);
        reject(err);
      }
    }, waitMs);

    controller.signal.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new Error('Request cancelled'));
    });
  });
}

// Clear old history periodically
setInterval(() => {
  const now = Date.now();
  for (const [url, time] of requestHistory) {
    if (now - time > 60000) {
      // Keep 1 minute history
      requestHistory.delete(url);
    }
  }
}, 60000);
