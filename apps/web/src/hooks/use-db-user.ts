'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

/**
 * Syncs the signed-in Clerk user to our DB and exposes the DB user object.
 * Returns { dbUser, clerkUser, isLoaded, isNew }
 */
export function useDbUser() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { dbUser, setDbUser } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['db-user-sync'],
    queryFn: async () => {
      const token = await getToken();
      const res = await api.post(
        '/auth/sync',
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return res.data;
    },
    enabled: !!(isLoaded && isSignedIn),
    staleTime: 5 * 60 * 1000, // 5 min
    retry: 2,
  });

  useEffect(() => {
    if (data) setDbUser(data);
  }, [data, setDbUser]);

  return {
    dbUser: dbUser ?? data,
    clerkUser,
    isLoaded,
    isSignedIn,
    isSyncing: isLoading,
    isNew: (dbUser ?? data)?.isNew === true,
  };
}
