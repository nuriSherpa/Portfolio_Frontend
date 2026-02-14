// utils/deviceId.ts

declare global {
  interface Window {
    __did: {
      get: () => Promise<string | null>;
      getSync: () => string | null;
    };
  }
}

interface StorageData {
  i: string; // id
  v: string; // version
  t: number; // timestamp
}

const STORAGE_KEY = '_x7' + '9k2';
const VERSION = 'v2';
const MAX_RETRIES = 3;

// Storage helpers with error handling
const storage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },
};

// Fast hash (cyrb53)
const hash = (str: string): string => {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
};

// Collect fingerprint
const getFingerprint = (): string => {
  const n = navigator;
  const s = screen;

  return [
    n.userAgent,
    n.language,
    n.platform,
    `${s.width}x${s.height}x${s.colorDepth}`,
    new Date().getTimezoneOffset(),
    n.hardwareConcurrency || 0,
    n.deviceMemory || 0,
    VERSION,
  ].join('\0');
};

// Generate ID
const generateId = (): string => {
  const fp = getFingerprint();
  const time = Date.now().toString(36).slice(-6);
  const rand = Math.random().toString(36).slice(2, 5);
  return hash(fp).slice(0, 16) + time + rand;
};

// Validate ID format
const isValidId = (id: unknown): id is string => {
  return typeof id === 'string' && id.length === 25 && /^[a-f0-9]{16}[a-z0-9]{9}$/.test(id);
};

// Read with retry
const readId = async (attempt = 1): Promise<string | null> => {
  try {
    const raw = storage.get(STORAGE_KEY);
    if (!raw) return null;

    const decoded = atob(raw);
    const parsed: StorageData = JSON.parse(decoded);

    if (!isValidId(parsed.i) || parsed.v !== VERSION) {
      throw new Error('Invalid data');
    }

    return parsed.i;
  } catch {
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 50 * attempt));
      return readId(attempt + 1);
    }

    storage.remove(STORAGE_KEY);
    return null;
  }
};

// Write with retry
const writeId = async (id: string, attempt = 1): Promise<boolean> => {
  try {
    const data: StorageData = { i: id, v: VERSION, t: Date.now() };
    const encoded = btoa(JSON.stringify(data));

    if (storage.set(STORAGE_KEY, encoded)) {
      const check = storage.get(STORAGE_KEY);
      return check === encoded;
    }

    throw new Error('Write failed');
  } catch {
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 100 * attempt));
      return writeId(id, attempt + 1);
    }
    return false;
  }
};

// Main async getter (auto-generates)
const getDeviceIdAsync = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;

  const existing = await readId();
  if (existing) return existing;

  const newId = generateId();
  writeId(newId).catch(() => {}); // Fire and forget

  return newId;
};

// Sync getter (immediate, async save)
const getDeviceIdSync = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = storage.get(STORAGE_KEY);
    if (raw) {
      const parsed: StorageData = JSON.parse(atob(raw));
      if (isValidId(parsed.i) && parsed.v === VERSION) {
        return parsed.i;
      }
    }
  } catch {
    // Ignore and generate new
  }

  const newId = generateId();
  writeId(newId).catch(() => {});
  return newId;
};

// Initialize global object
if (typeof window !== 'undefined') {
  window.__did = {
    get: getDeviceIdAsync,
    getSync: getDeviceIdSync,
  };
}

// Export wrappers
export const getDeviceId = (): Promise<string | null> => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  return window.__did.get();
};

export const getDeviceIdSync = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.__did.getSync();
};
