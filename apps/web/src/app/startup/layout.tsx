'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from '@/components/layout/sidebar';

export default function StartupLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/auth/login');
    else if (user.role !== 'STARTUP') router.push('/');
  }, [user]);

  if (!user || user.role !== 'STARTUP') return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role="STARTUP" />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
