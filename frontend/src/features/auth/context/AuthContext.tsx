'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/shared/services/api';
import type { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
        api.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
      } catch {
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await api.post('/auth/login', { username, password });
    const authUser: AuthUser = {
      username: data.username,
      role: data.role,
      token: data.token,
    };
    // Clear all cached queries so the next user does not see stale data
    queryClient.clear();
    setUser(authUser);
    localStorage.setItem('auth_user', JSON.stringify(authUser));
    api.defaults.headers.common['Authorization'] = `Bearer ${authUser.token}`;
    router.push('/');
  }, [queryClient, router]);

  const register = useCallback(async (username: string, password: string) => {
    const { data } = await api.post('/auth/register', { username, password });
    const authUser: AuthUser = {
      username: data.username,
      role: data.role,
      token: data.token,
    };
    queryClient.clear();
    setUser(authUser);
    localStorage.setItem('auth_user', JSON.stringify(authUser));
    api.defaults.headers.common['Authorization'] = `Bearer ${authUser.token}`;
    router.push('/');
  }, [queryClient, router]);

  const logout = useCallback(() => {
    queryClient.clear();
    setUser(null);
    localStorage.removeItem('auth_user');
    delete api.defaults.headers.common['Authorization'];
    router.push('/login');
  }, [queryClient, router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
