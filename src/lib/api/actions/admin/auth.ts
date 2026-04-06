// src/lib/api/actions/admin/auth.ts

import { adminCore } from '@/lib/api/admin-core';
import { ADMIN_ENDPOINTS } from '@/lib/api/admin-endpoints';

export interface AdminUser {
  id: string;
  username: string;
  email?: string;
  role: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  secret: string;
  username: string;
  password: string;
  role: 'admin' | 'editor';
}

interface LoginResponse {
  success: boolean;
  user: AdminUser;
}

interface CheckAuthResponse {
  valid?: boolean;
  authenticated?: boolean;
  user?: AdminUser;
}

// ─── Login ──────────────────────────────────────────────────────────────────

export async function adminLogin(data: LoginData): Promise<{
  success: boolean;
  user?: AdminUser;
  error?: string;
}> {
  const { data: result, error } = await adminCore.post<LoginResponse>(
    ADMIN_ENDPOINTS.auth.login,
    data,
    false,
  );

  // Return error from coreFetch (already extracted message)
  if (error) {
    return { success: false, error };
  }

  // Check result has user
  if (!result || !result.user) {
    return { success: false, error: 'Invalid response from server' };
  }

  return {
    success: true,
    user: result.user, // Return user directly, not nested in data
  };
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function adminRegister(data: RegisterData): Promise<{
  success: boolean;
  user?: AdminUser;
  error?: string;
}> {
  const { data: result, error } = await adminCore.post<LoginResponse>(
    ADMIN_ENDPOINTS.auth.register,
    data,
    false,
  );

  if (error) {
    return { success: false, error };
  }

  if (!result || !result.user) {
    return { success: false, error: 'Invalid response from server' };
  }

  return {
    success: true,
    user: result.user,
  };
}

// ─── Check Auth ───────────────────────────────────────────────────────────────

export async function checkAdminAuth(): Promise<{
  authenticated: boolean;
  user?: AdminUser;
}> {
  const { data, error } = await adminCore.get<CheckAuthResponse>(ADMIN_ENDPOINTS.auth.check, false);

  if (error || !data) {
    return { authenticated: false };
  }

  return {
    authenticated: data.valid || data.authenticated || false,
    user: data.user,
  };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

// src/lib/api/actions/admin/auth.ts

export async function adminLogout(): Promise<void> {
  try {
    const baseUrl =
      typeof window !== 'undefined' && window.location.hostname === 'tendinurisherpa.com.np'
        ? 'http://localhost:9090/api/v1/admin'
        : '/api/admin';

    const res = await fetch(`${baseUrl}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      console.error('Logout failed:', await res.text());
    }
  } catch (error) {
    console.error('Logout error:', error);
  }

  // Hard redirect to clear all state
  window.location.href = '/xk92-cms';
}
