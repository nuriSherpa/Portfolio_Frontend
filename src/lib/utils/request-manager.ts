// src/lib/utils/request-manager.ts

// Track in-flight requests to prevent duplicates
const pendingRequests = new Map<string, AbortController>();
const requestHistory = new Map<string, number>(); // url -> timestamp

// Debounce config
const DEBOUNCE_MS = 300;
const REFRESH_COOLDOWN_MS = 2000;

interface RequestConfig {
  url: string;
  method?: string;
  skipDebounce?: boolean;
}

export function createRequestKey(config: RequestConfig): string {
  return `${config.method || 'GET'}:${config.url}`;
}

// FIXED: Add isServer parameter to skip blocking on server
export function shouldBlockRequest(url: string, isServer = false): boolean {
  // NEVER block on server-side requests
  if (isServer) {
    return false;
  }

  const now = Date.now();
  const lastRequest = requestHistory.get(url);

  if (lastRequest && now - lastRequest < REFRESH_COOLDOWN_MS) {
    console.log(`[RequestManager] Blocked: ${url} (refresh cooldown)`);
    return true;
  }

  requestHistory.set(url, now);
  return false;
}

export function debounceRequest<T>(
  key: string,
  fn: () => Promise<T>,
  waitMs: number = DEBOUNCE_MS,
): Promise<T> {
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
      requestHistory.delete(url);
    }
  }
}, 60000);
