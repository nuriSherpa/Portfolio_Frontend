'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';

// Global state to track initialization across components
let globalInitState: 'idle' | 'initializing' | 'ready' | 'error' | 'blocked' = 'idle';
let globalInitPromise: Promise<void> | null = null;
let globalCooldownSeconds = 0;

const COOKIE_TOKEN = 'visitor_token';
const COOKIE_ID = 'visitor_id';
const COOKIE_COOLDOWN = 'visitor_cooldown_until';
const TOKEN_EXPIRY_DAYS = 7;

// Cookie helper functions
function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    navigator.hardwareConcurrency || 'unknown',
  ];
  return btoa(components.join('|'))
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 32);
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
}

function parseCooldown(errorData: any): number | null {
  const details = errorData?.details || errorData?.error?.details;
  if (details?.cooldownUntil) {
    const cooldownDate = new Date(details.cooldownUntil);
    const now = new Date();
    const diffMs = cooldownDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffMs / 1000));
  }
  return null;
}

export function getStoredCooldown(): number | null {
  const stored = getCookie(COOKIE_COOLDOWN);
  if (stored) {
    const cooldownTime = parseInt(stored);
    const remaining = Math.ceil((cooldownTime - Date.now()) / 1000);
    if (remaining > 0) {
      return remaining;
    }
    deleteCookie(COOKIE_COOLDOWN);
  }
  return null;
}

function setStoredCooldown(seconds: number): void {
  const until = Date.now() + seconds * 1000;
  // Store cooldown as session cookie (or set short expiry) - it will be checked against server time
  setCookie(COOKIE_COOLDOWN, until.toString(), 1); // 1 day is plenty for cooldowns
}

export function clearStoredCooldown(): void {
  deleteCookie(COOKIE_COOLDOWN);
}

async function initVisitorInternal(): Promise<void> {
  // Check stored cooldown first
  const storedCooldown = getStoredCooldown();
  if (storedCooldown) {
    console.log('[Visitor] Stored cooldown found:', storedCooldown);
    globalCooldownSeconds = storedCooldown;
    globalInitState = 'blocked';
    throw new Error('COOLDOWN_ACTIVE');
  }

  const existingToken = getCookie(COOKIE_TOKEN);

  if (existingToken) {
    api.defaults.headers['X-Visitor-Token'] = existingToken;
    console.log('[Visitor] Using existing token, skipping validation');
    globalInitState = 'ready';
    return;
  }

  // Get new token
  try {
    console.log('[Visitor] Requesting new token...');
    const fingerprint = generateFingerprint();
    const device = getDeviceType();

    const res = await api.post(ENDPOINTS.visitorInit, {
      fingerprint,
      device,
      country: 'unknown',
    });

    const { token, userID } = res.data.data;

    // Store in cookies with 7-day expiration
    setCookie(COOKIE_TOKEN, token, TOKEN_EXPIRY_DAYS);
    setCookie(COOKIE_ID, userID, TOKEN_EXPIRY_DAYS);
    api.defaults.headers['X-Visitor-Token'] = token;

    console.log('[Visitor] New token acquired');
    globalInitState = 'ready';
  } catch (error: any) {
    const code = error.response?.data?.error?.code;

    if (code === 'VISITOR_BLOCKED') {
      const cooldownSeconds = parseCooldown(error.response?.data);
      if (cooldownSeconds) {
        setStoredCooldown(cooldownSeconds);
        globalCooldownSeconds = cooldownSeconds;
      }
      globalInitState = 'blocked';
      throw new Error('VISITOR_BLOCKED');
    }

    console.error('[Visitor] Failed to get token:', error);
    globalInitState = 'error';
    throw error;
  }
}

export function useVisitor() {
  const [state, setState] = useState<{
    isReady: boolean;
    isBlocked: boolean;
    isError: boolean;
    cooldownSeconds: number;
  }>({
    isReady: globalInitState === 'ready',
    isBlocked: globalInitState === 'blocked',
    isError: globalInitState === 'error',
    cooldownSeconds: globalCooldownSeconds,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // If already initialized, use global state
    if (globalInitState === 'ready') {
      setState({ isReady: true, isBlocked: false, isError: false, cooldownSeconds: 0 });
      return;
    }

    if (globalInitState === 'blocked') {
      const remaining = getStoredCooldown();
      setState({
        isReady: false,
        isBlocked: true,
        isError: false,
        cooldownSeconds: remaining || 0,
      });
      return;
    }

    // Start initialization if not already
    if (!globalInitPromise) {
      globalInitState = 'initializing';
      globalInitPromise = initVisitorInternal();
    }

    globalInitPromise
      .then(() => {
        setState({ isReady: true, isBlocked: false, isError: false, cooldownSeconds: 0 });
      })
      .catch((err) => {
        if (err.message === 'VISITOR_BLOCKED' || err.message === 'COOLDOWN_ACTIVE') {
          const remaining = getStoredCooldown();
          setState({
            isReady: false,
            isBlocked: true,
            isError: false,
            cooldownSeconds: remaining || 0,
          });
        } else {
          setState({
            isReady: false,
            isBlocked: false,
            isError: true,
            cooldownSeconds: 0,
          });
        }
      });
  }, []);

  return state;
}

// This function blocks until visitor is ready
export async function waitForVisitor(): Promise<{
  success: boolean;
  blocked: boolean;
  error: boolean;
  cooldownSeconds: number;
}> {
  if (typeof window === 'undefined') {
    return { success: false, blocked: false, error: true, cooldownSeconds: 0 };
  }

  // Check cooldown first
  const cooldown = getStoredCooldown();
  if (cooldown) {
    return { success: false, blocked: true, error: false, cooldownSeconds: cooldown };
  }

  // If already ready
  if (globalInitState === 'ready') {
    return { success: true, blocked: false, error: false, cooldownSeconds: 0 };
  }

  // If blocked
  if (globalInitState === 'blocked') {
    const remaining = getStoredCooldown();
    return { success: false, blocked: true, error: false, cooldownSeconds: remaining || 0 };
  }

  // Initialize
  if (!globalInitPromise) {
    globalInitState = 'initializing';
    globalInitPromise = initVisitorInternal();
  }

  try {
    await globalInitPromise;
    return { success: true, blocked: false, error: false, cooldownSeconds: 0 };
  } catch (err: any) {
    if (err.message === 'VISITOR_BLOCKED' || err.message === 'COOLDOWN_ACTIVE') {
      const remaining = getStoredCooldown();
      return { success: false, blocked: true, error: false, cooldownSeconds: remaining || 0 };
    }
    return { success: false, blocked: false, error: true, cooldownSeconds: 0 };
  }
}
