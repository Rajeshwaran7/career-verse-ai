'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Moon, Sun, Zap, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { useDbUser } from '@/hooks/use-db-user';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { isSignedIn } = useAuth();
  const { dbUser } = useDbUser();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/search', label: 'Discover Talent' },
    { href: '/internships', label: 'Internships' },
    { href: '/#features', label: 'Features' },
  ];

  const dashboardPath =
    dbUser?.role === 'STUDENT'
      ? '/student/dashboard'
      : dbUser?.role === 'STARTUP'
        ? '/startup/dashboard'
        : dbUser?.role === 'ADMIN'
          ? '/admin/dashboard'
          : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            Career<span className="text-gradient">Verse</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {isSignedIn ? (
            <div className="flex items-center gap-2">
              {dashboardPath && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={dashboardPath}>Dashboard</Link>
                </Button>
              )}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'h-8 w-8',
                  },
                }}
              />
            </div>
          ) : (
            <>
              <SignInButton mode="redirect">
                <Button variant="ghost" size="sm">Log in</Button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <Button variant="gradient" size="sm">Get Started</Button>
              </SignUpButton>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-muted-foreground hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <>
                <SignInButton mode="redirect">
                  <Button variant="outline" size="sm">Log in</Button>
                </SignInButton>
                <SignUpButton mode="redirect">
                  <Button variant="gradient" size="sm">Get Started</Button>
                </SignUpButton>
              </>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
}
