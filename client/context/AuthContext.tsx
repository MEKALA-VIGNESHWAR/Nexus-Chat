'use client';

/**
 * Authentication Context Provider
 * Manages user session lifecycle, auth requests, and local token storage.
 */
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../lib/api';
import { STORAGE_KEYS } from '../lib/constants';

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (updates: any) => Promise<any>;
  updateAvatar: (formData: FormData) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  /**
   * Clean up local authentication state.
   */
  const logoutLocal = useCallback(() => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
  }, []);

  /**
   * Fetches the current user profile from backend.
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
    } catch (error) {
      // Clear token if user fetch failed (session expired/invalid)
      logoutLocal();
    } finally {
      setLoading(false);
    }
  }, [logoutLocal]);

  // Sync user profile if token is present on startup
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchCurrentUser]);

  // Listen for interceptor-triggered logouts (e.g. failed token rotation)
  useEffect(() => {
    const handleAuthLogout = () => {
      logoutLocal();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-logout', handleAuthLogout);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-logout', handleAuthLogout);
      }
    };
  }, [logoutLocal]);

  // Listen for silent token refresh events from axios interceptor
  useEffect(() => {
    const handleTokenRefresh = (e: Event) => {
      const customEvent = e as CustomEvent;
      setToken(customEvent.detail);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-token-refresh', handleTokenRefresh);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-token-refresh', handleTokenRefresh);
      }
    };
  }, []);

  /**
   * Registers a new user.
   */
  const register = async (username: string, email: string, password: string, confirmPassword: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        confirmPassword,
      });

      const { user: profile, accessToken } = response.data.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      }
      setToken(accessToken);
      setUser(profile);
      return { success: true };
    } catch (error: any) {
      logoutLocal();
      const message = error.response?.data?.message || 'Registration failed';
      const validationErrors = error.response?.data?.errors || [];
      return { success: false, message, errors: validationErrors };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Authenticates a user.
   */
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: profile, accessToken } = response.data.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      }
      setToken(accessToken);
      setUser(profile);
      return { success: true };
    } catch (error: any) {
      logoutLocal();
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logouts and invalidates the session in both backend and local state.
   */
  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore backend logout errors — proceed with local cleanup
    } finally {
      logoutLocal();
      setLoading(false);
    }
  };

  /**
   * Updates user profile fields.
   */
  const updateProfile = async (updates: any) => {
    try {
      const response = await api.patch('/users/profile', updates);
      setUser(response.data.data);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
      };
    }
  };

  /**
   * Updates user avatar picture.
   */
  const updateAvatar = async (formData: FormData) => {
    try {
      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(response.data.data);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload avatar',
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    updateAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
