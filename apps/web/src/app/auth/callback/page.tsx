'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Zap } from 'lucide-react';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');

    if (token) {
      localStorage.setItem('cv_token', token);
      refreshUser().then(() => {
        if (role === 'STARTUP') router.push('/startup/dashboard');
        else router.push('/student/dashboard');
      });
    } else {
      router.push('/auth/login?error=oauth_failed');
    }
  }, [searchParams]);

  return (
    <div className="text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary mx-auto mb-4 animate-pulse">
        <Zap className="h-8 w-8 text-white" />
      </div>
      <p className="text-white text-lg font-medium">Signing you in…</p>
      <p className="text-slate-400 text-sm mt-1">Please wait a moment</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center">
      <Suspense fallback={
        <div className="text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary mx-auto mb-4 animate-pulse">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <p className="text-white text-lg font-medium">Loading…</p>
        </div>
      }>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
