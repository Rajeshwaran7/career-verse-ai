'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, User, Briefcase, Search, Star,
  Building2, Zap, LogOut, BarChart3, Users,
} from 'lucide-react';
import { useClerk, useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { useDbUser } from '@/hooks/use-db-user';

const studentNav = [
  { href: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/student/profile', icon: User, label: 'My Profile' },
  { href: '/student/passport', icon: Zap, label: 'AI Passport' },
  { href: '/search', icon: Search, label: 'Browse Jobs' },
  { href: '/student/dashboard', icon: Briefcase, label: 'Applications' },
];

const startupNav = [
  { href: '/startup/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/startup/profile', icon: Building2, label: 'Company Profile' },
  { href: '/startup/jobs', icon: Briefcase, label: 'Job Postings' },
  { href: '/startup/search', icon: Search, label: 'Find Talent' },
  { href: '/startup/candidates', icon: Star, label: 'Saved Candidates' },
];

const adminNav = [
  { href: '/admin/dashboard', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/companies', icon: Building2, label: 'Companies' },
  { href: '/admin/internships', icon: Briefcase, label: 'Internships' },
];

export function Sidebar({ role }: { role: 'STUDENT' | 'STARTUP' | 'ADMIN' }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const { dbUser } = useDbUser();

  const navItems = role === 'STUDENT' ? studentNav : role === 'STARTUP' ? startupNav : adminNav;
  const displayName =
    (dbUser as any)?.name ||
    clerkUser?.fullName ||
    clerkUser?.firstName ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    '';
  const avatarUrl = clerkUser?.imageUrl;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">
          Career<span className="text-gradient">Verse</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'gradient-primary text-white shadow-md shadow-blue-500/20'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="gradient-primary text-white text-xs">
              {displayName ? getInitials(displayName) : '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground capitalize">{role.toLowerCase()}</p>
          </div>
          <button
            onClick={() => signOut(() => router.push('/'))}
            className="rounded-md p-1 text-muted-foreground hover:text-destructive transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
