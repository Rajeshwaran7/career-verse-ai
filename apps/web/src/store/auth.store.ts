'use client';

import { create } from 'zustand';
import type { User } from '@/types';

/**
 * Stores only the DB-side user info (role, profile, name).
 * Clerk manages auth state — this handles what our backend knows about the user.
 */
interface AppUserStore {
  dbUser: (User & { name?: string; isNew?: boolean }) | null;
  isLoading: boolean;
  setDbUser: (user: (User & { name?: string; isNew?: boolean }) | null) => void;
  setLoading: (v: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AppUserStore>((set) => ({
  dbUser: null,
  isLoading: false,
  setDbUser: (dbUser) => set({ dbUser }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ dbUser: null }),
}));
