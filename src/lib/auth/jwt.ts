// src/lib/auth/jwt.ts
import { jwtVerify, importSPKI, decodeJwt } from 'jose';

export interface AdminTokenPayload {
  s: string; // userId
  r: string; // role
  i: string; // sessionId
  t: 'a' | 'r'; // token type
  v: string; // token version
  e?: string; // email (optional)
  iat: number;
  exp: number;
  iss?: string;
  aud?: string | string[];
  // Convenience aliases
  userId?: string;
  role?: string;
  sessionId?: string;
  email?: string;
}

// Cache the imported key — importSPKI is expensive
let _publicKey: Awaited<ReturnType<typeof importSPKI>> | null = null;

async function getPublicKey() {
  if (_publicKey) return _publicKey;

  const pem = process.env.NEXT_PUBLIC_ADMIN_JWT_PUBLIC_KEY;
  if (!pem) throw new Error('NEXT_PUBLIC_ADMIN_JWT_PUBLIC_KEY is not set');

  // Handle escaped newlines from .env
  const normalized = pem.replace(/\\n/g, '\n');
  _publicKey = await importSPKI(normalized, 'EdDSA');
  return _publicKey;
}

function normalizePayload(raw: Record<string, unknown>): AdminTokenPayload {
  const payload = raw as unknown as AdminTokenPayload;
  payload.userId = raw.s as string;
  payload.role = raw.r as string;
  payload.sessionId = raw.i as string;
  payload.email = raw.e as string | undefined;
  return payload;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const key = await getPublicKey();

    const { payload: raw } = await jwtVerify(token, key, {
      issuer: process.env.NEXT_PUBLIC_JWT_ISSUER || 'secure-admin-app',
      audience: process.env.NEXT_PUBLIC_JWT_AUDIENCE || 'admin-api',
    });

    return normalizePayload(raw as Record<string, unknown>);
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };

    if (err.code === 'ERR_JWT_EXPIRED') {
      console.log('[jwt] Token expired');
      return null;
    }

    console.error('[jwt] Verification error:', err.message);
    return null;
  }
}

// ─── Decode without verification (for debugging) ──────────────────────────────

export function decodeTokenPayload(token: string): AdminTokenPayload | null {
  try {
    const raw = decodeJwt(token);
    return normalizePayload(raw as Record<string, unknown>);
  } catch (e) {
    console.error('[jwt] Decode error:', e);
    return null;
  }
}
