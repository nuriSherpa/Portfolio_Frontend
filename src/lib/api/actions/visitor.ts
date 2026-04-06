// src/lib/api/actions/visitor.ts
import { post, ENDPOINTS } from '../client-fetch';
import {
  FpPayload,
  readBestPayload,
  isSignatureValid,
  isWithin24hr,
  persistPayload,
  setCached,
  getCached,
  clearCache,
} from '@/lib/fingerprint';

let _initialized = false;
let _inflight: Promise<void> | null = null;
const MAX_RETRIES = 2;

const attempt = async (retryCount = 0): Promise<void> => {
  try {
    // 1. Memory cache
    if (getCached()) {
      _initialized = true;
      return;
    }

    // 2. Check storage
    const stored = readBestPayload();
    if (stored) {
      const sigOk = await isSignatureValid(stored);

      if (!sigOk) {
        console.warn('[visitor] tampered payload — re-initializing');
        clearCache();
      } else if (isWithin24hr(stored)) {
        // Valid + fresh — skip server entirely
        console.log('[visitor] within 24hr — skipping server call');
        setCached(stored);
        persistPayload(stored);
        _initialized = true;
        return;
      }
      // Valid sig but >24hr — fall through to server
      console.log('[visitor] >24hr — calling server');
    }

    // 3. Hit server — new visitor or >24hr
    console.log('[visitor] calling server...');
    const res = await post<{ signedFingerprint?: string; lastSeen?: string }>(
      ENDPOINTS.visitorInit,
      { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'unknown' },
    );
    console.log('[visitor] server res:', res);

    // Server returned signedFingerprint — parse and use directly
    if (res.signedFingerprint) {
      let payload: FpPayload;
      try {
        payload = JSON.parse(res.signedFingerprint);
      } catch {
        throw new Error('Invalid signedFingerprint from server');
      }

      if (!payload.fingerprint || !payload.signature) {
        throw new Error('Incomplete payload from server');
      }

      // Always use server response — it has fresh lastSeen
      setCached(payload);
      persistPayload(payload);
      _initialized = true;
      console.log('[visitor] initialized from server:', payload.fingerprint.slice(0, 8));
      return;
    }

    // Server returned success:false (returning within 24hr — server short-circuit)
    if (res.lastSeen && stored) {
      console.log('[visitor] server confirmed returning visitor');
      setCached(stored);
      persistPayload({ ...stored, lastSeen: res.lastSeen });
      _initialized = true;
      return;
    }

    throw new Error('No usable response from server');
  } catch (err) {
    console.error(`[visitor] attempt ${retryCount + 1} failed:`, err);
    if (retryCount < MAX_RETRIES) {
      clearCache();
      return attempt(retryCount + 1);
    }
    console.error('[visitor] max retries reached');
  }
};

export const initVisitor = async (): Promise<void> => {
  if (_initialized) return;
  if (_inflight) return _inflight;
  _inflight = attempt().finally(() => {
    _inflight = null;
  });
  return _inflight;
};

export const resetVisitor = () => {
  _initialized = false;
  clearCache();
};
