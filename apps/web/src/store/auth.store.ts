'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string, name?: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string, user: User) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data.user, token: data.accessToken, isLoading: false });
          if (typeof window !== 'undefined') {
            localStorage.setItem('cv_token', data.accessToken);
          }
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      register: async (email, password, role, name) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', { email, password, role, name });
          set({ user: data.user, token: data.accessToken, isLoading: false });
          if (typeof window !== 'undefined') {
            localStorage.setItem('cv_token', data.accessToken);
          }
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      logout: () => {
        set({ user: null, token: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cv_token');
          localStorage.removeItem('cv_user');
        }
      },

      setToken: (token, user) => {
        set({ token, user });
        if (typeof window !== 'undefined') {
          localStorage.setItem('cv_token', token);
        }
      },

      refreshUser: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'cv-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
