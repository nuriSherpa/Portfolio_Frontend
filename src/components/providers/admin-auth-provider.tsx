// src/components/providers/admin-auth-provider.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAdminCheck } from '@/hooks/use-admin-check';

interface AdminUser {
  userId: string;
  role: string;
  permissions: string[];
}

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AdminUser | null;
  error: string | null;
}

const AdminAuthContext = createContext<AuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const auth = useAdminCheck();

  return <AdminAuthContext.Provider value={auth}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
