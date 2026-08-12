'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useDbUser } from '@/hooks/use-db-user';
import { Sidebar } from '@/components/layout/sidebar';
import { Zap } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { dbUser, isSyncing } = useDbUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.push('/auth/login'); return; }
    if (!isSyncing && dbUser && dbUser.role !== 'ADMIN') {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, dbUser, isSyncing, router]);

  if (!isLoaded || isSyncing || !dbUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary animate-pulse">
          <Zap className="h-6 w-6 text-white" />
        </div>
      </div>
    );
  }

  if (dbUser.role !== 'ADMIN') return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role="ADMIN" />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
