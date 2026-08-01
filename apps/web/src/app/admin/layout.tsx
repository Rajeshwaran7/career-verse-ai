'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from '@/components/layout/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/auth/login');
    else if (user.role !== 'ADMIN') router.push('/');
  }, [user]);

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role="ADMIN" />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
