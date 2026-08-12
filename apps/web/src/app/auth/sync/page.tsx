'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { Zap } from 'lucide-react';
import api from '@/lib/api';

export default function AuthSyncPage() {
  const router = useRouter();
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const { data, isError } = useQuery({
    queryKey: ['auth-sync'],
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
    retry: 2,
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.push('/auth/login'); return; }
    if (!data) return;

    if (data.isNew) {
      router.push('/onboarding');
    } else if (data.role === 'STUDENT') {
      router.push('/student/dashboard');
    } else if (data.role === 'STARTUP') {
      router.push('/startup/dashboard');
    } else if (data.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/onboarding');
    }
  }, [data, isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center">
      <div className="text-center">
        {isError ? (
          <p className="text-white text-lg">Something went wrong. Please try again.</p>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary mx-auto mb-4 animate-pulse">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <p className="text-white text-lg font-medium">Setting up your account…</p>
            <p className="text-slate-400 text-sm mt-1">Just a moment</p>
          </>
        )}
      </div>
    </div>
  );
}
