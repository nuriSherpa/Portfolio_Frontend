const COOKIE_NAME = '_fpid';
const PUBLIC_KEY_B64 = process.env.NEXT_PUBLIC_FP_PUBLIC_KEY ?? '';
const LS_KEY = '_fpid_ls';
const SS_KEY = '_fpid_ss';
export const UNIQUE_VISITOR_WINDOW = 24 * 60 * 60 * 1000;

export interface FpPayload {
  fingerprint: string;
  signature: string;
  lastSeen: string;
}

// ─── Base64 utilities ─────────────────────────────────────────────────────────

const b64ToBytes = (b64: string): Uint8Array => {
  const std = b64
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
  const bin = atob(std);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
};

// ─── Crypto ───────────────────────────────────────────────────────────────────

let _pubKey: CryptoKey | null = null;

const getPublicKey = async (): Promise<CryptoKey> => {
  if (_pubKey) return _pubKey;
  _pubKey = await crypto.subtle.importKey(
    'spki',
    b64ToBytes(PUBLIC_KEY_B64).buffer as ArrayBuffer,
    { name: 'Ed25519' },
    false,
    ['verify'],
  );
  return _pubKey;
};

export const verifySignature = async (fingerprint: string, sig: string): Promise<boolean> => {
  try {
    const key = await getPublicKey();
    const sigBytes = b64ToBytes(sig);
    const dataBytes = new TextEncoder().encode(fingerprint);
    return await crypto.subtle.verify(
      'Ed25519',
      key,
      sigBytes.buffer as ArrayBuffer,
      dataBytes.buffer as ArrayBuffer,
    );
  } catch {
    return false;
  }
};

// ─── Validation helpers ───────────────────────────────────────────────────────

const isValidShape = (p: unknown): p is FpPayload => {
  if (!p || typeof p !== 'object') return false;
  const obj = p as Record<string, unknown>;
  return (
    typeof obj.fingerprint === 'string' &&
    obj.fingerprint.length > 0 &&
    typeof obj.signature === 'string' &&
    obj.signature.length > 0 &&
    typeof obj.lastSeen === 'string' &&
    obj.lastSeen.length > 0
  );
};

// Signature valid — identity check only, no age
export const isSignatureValid = async (payload: FpPayload): Promise<boolean> => {
  try {
    return await verifySignature(payload.fingerprint, payload.signature);
  } catch {
    return false;
  }
};

// Within 24hr — client-side optimization to skip server call
export const isWithin24hr = (payload: FpPayload): boolean => {
  try {
    return Date.now() - new Date(payload.lastSeen).getTime() < UNIQUE_VISITOR_WINDOW;
  } catch {
    return false;
  }
};

// Full validation — valid signature AND within 24hr window
export const isPayloadValid = async (payload: FpPayload): Promise<boolean> => {
  const sigOk = await isSignatureValid(payload);
  if (!sigOk) return false;
  return isWithin24hr(payload);
};

// ─── Storage ──────────────────────────────────────────────────────────────────

const readCookie = (): FpPayload | null => {
  try {
    const match = document.cookie.split('; ').find((r) => r.startsWith(`${COOKIE_NAME}=`));
    if (!match) return null;
    const val = decodeURIComponent(match.split('=').slice(1).join('='));
    const p = JSON.parse(val);
    return isValidShape(p) ? p : null;
  } catch {
    return null;
  }
};

const readLS = (): FpPayload | null => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return isValidShape(p) ? p : null;
  } catch {
    return null;
  }
};

const readSS = (): FpPayload | null => {
  try {
    const raw = sessionStorage.getItem(SS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return isValidShape(p) ? p : null;
  } catch {
    return null;
  }
};

export const persistPayload = (payload: FpPayload): void => {
  const str = JSON.stringify(payload);
  try {
    localStorage.setItem(LS_KEY, str);
  } catch {
    /* quota */
  }
  try {
    sessionStorage.setItem(SS_KEY, str);
  } catch {
    /* quota */
  }
};

export const readBestPayload = (): FpPayload | null => readCookie() ?? readLS() ?? readSS() ?? null;

// ─── In-memory cache ──────────────────────────────────────────────────────────

let _cache: FpPayload | null = null;
export const getCached = () => _cache;
export const setCached = (p: FpPayload) => {
  _cache = p;
};
export const clearCache = () => {
  _cache = null;
};
