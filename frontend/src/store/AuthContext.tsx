'use client';
// src/store/AuthContext.tsx — Global authentication state

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthResponse } from '@/types';
import api from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'landowner' | 'tenant';
  phone?: string;
  location?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('agtech_token');
    const storedUser = localStorage.getItem('agtech_user');
    if (storedToken && storedUser && storedToken !== 'undefined') {
      // eslint-disable-next-line
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
    // eslint-disable-next-line
    setIsLoading(false);
  }, []);

  const persistAuth = (data: AuthResponse) => {
    const tokenToSave = data.token || (data as any).accessToken;
    if (tokenToSave && tokenToSave !== 'undefined') {
      localStorage.setItem('agtech_token', tokenToSave);
      localStorage.setItem('agtech_user', JSON.stringify(data.user));
      setToken(tokenToSave);
      setUser(data.user);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    persistAuth(res.data);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    await api.post('/auth/register', data);
  }, []);

  const verifyEmail = useCallback(async (email: string, otp: string) => {
    const res = await api.post<AuthResponse>('/auth/verify-email', { email, otp });
    persistAuth(res.data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('agtech_token');
    localStorage.removeItem('agtech_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      isAuthenticated: !!user && !!token,
      login, register, verifyEmail, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
