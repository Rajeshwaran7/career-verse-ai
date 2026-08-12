'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Zap, GraduationCap, Building2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Role = 'STUDENT' | 'STARTUP';

export default function OnboardingPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [name, setName] = useState(
    clerkUser?.fullName || clerkUser?.firstName || '',
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedRole || !name.trim()) return;
    setLoading(true);
    try {
      const token = await getToken();
      await api.post(
        '/auth/sync',
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await api.post(
        '/auth/role',
        { role: selectedRole, name: name.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast({ title: '🎉 Welcome to CareerVerse AI!', variant: 'success' });
      router.push(selectedRole === 'STUDENT' ? '/student/dashboard' : '/startup/dashboard');
    } catch {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      value: 'STUDENT' as Role,
      icon: GraduationCap,
      title: 'Student',
      subtitle: 'Build your AI Talent Passport and get discovered',
      gradient: 'from-blue-500 to-indigo-600',
      features: ['AI Talent Passport', 'GitHub integration', 'Resume parsing', 'Apply to internships'],
    },
    {
      value: 'STARTUP' as Role,
      icon: Building2,
      title: 'Startup / Company',
      subtitle: 'Find and hire the best student talent with AI',
      gradient: 'from-purple-500 to-pink-600',
      features: ['AI-powered search', 'Candidate ranking', 'Post internships', 'Save candidates'],
    },
  ];

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary mx-auto mb-4">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to CareerVerse AI</h1>
            <p className="text-slate-400 text-lg">
              Hey {clerkUser?.firstName || 'there'}! How will you use CareerVerse?
            </p>
          </div>

          {/* Name input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {selectedRole === 'STARTUP' ? 'Company Name' : 'Your Full Name'}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={selectedRole === 'STARTUP' ? 'Acme Technologies' : 'John Doe'}
              className="bg-white/10 border-white/20 text-white placeholder-slate-500 h-12 text-base"
            />
          </div>

          {/* Role cards */}
          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            {roles.map((role) => (
              <motion.div
                key={role.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={cn(
                    'cursor-pointer transition-all border-2',
                    selectedRole === role.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/30',
                  )}
                  onClick={() => setSelectedRole(role.value)}
                >
                  <CardContent className="p-6">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${role.gradient} mb-4`}
                    >
                      <role.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{role.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{role.subtitle}</p>
                    <ul className="space-y-1.5">
                      {role.features.map((f) => (
                        <li key={f} className="text-xs text-slate-400 flex items-center gap-1.5">
                          <span className="text-green-400">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    {selectedRole === role.value && (
                      <div className="mt-4 flex items-center gap-1.5 text-blue-400 text-sm font-medium">
                        <span className="h-2 w-2 rounded-full bg-blue-400" />
                        Selected
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Button
            variant="gradient"
            size="xl"
            className="w-full shadow-xl shadow-blue-500/30"
            disabled={!selectedRole || !name.trim() || loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-5 w-5" />
            )}
            {loading
              ? 'Setting up your account…'
              : `Continue as ${selectedRole === 'STARTUP' ? 'a Startup' : selectedRole === 'STUDENT' ? 'a Student' : '…'}`}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
