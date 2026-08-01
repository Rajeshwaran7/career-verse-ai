'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/hooks/use-toast';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      const user = useAuthStore.getState().user;
      toast({ title: 'Welcome back!', variant: 'success' });
      if (user?.role === 'STUDENT') router.push('/student/dashboard');
      else if (user?.role === 'STARTUP') router.push('/startup/dashboard');
      else if (user?.role === 'ADMIN') router.push('/admin/dashboard');
    } catch (err: any) {
      toast({
        title: 'Login failed',
        description: err?.response?.data?.message || 'Invalid credentials',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-white font-bold text-2xl">CareerVerse AI</span>
            </Link>
            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            <p className="text-slate-400 mt-2">Sign in to your account</p>
          </div>

          <div className="glass-card rounded-2xl p-8 dark:bg-slate-900/90">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <Input type="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
              </div>

              <Button type="submit" variant="gradient" className="w-full mt-2" loading={isLoading}>
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-4 text-center">
              <span className="text-sm text-muted-foreground">Don't have an account? </span>
              <Link href="/auth/register" className="text-sm text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`)}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
