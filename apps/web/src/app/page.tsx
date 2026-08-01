'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Brain, Search, Star, Github, FileText, Users, Building2, TrendingUp, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/layout/navbar';

const features = [
  {
    icon: Brain,
    title: 'AI Talent Passport',
    description: 'Each student gets an AI-generated profile with skill scores, strengths, and personalized insights.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Search,
    title: 'Semantic Search',
    description: 'Search in plain English. "Find React developers in Chennai" — get ranked, relevant results instantly.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: Github,
    title: 'GitHub Intelligence',
    description: 'Automatic GitHub analysis — repositories, stars, languages, and contribution patterns.',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: FileText,
    title: 'Smart Resume Parsing',
    description: 'Upload a PDF. AI extracts skills, education, projects and auto-populates your profile.',
    color: 'from-orange-500 to-red-600',
  },
  {
    icon: Star,
    title: 'Candidate Ranking',
    description: 'AI scores and ranks candidates based on skills, projects, and GitHub activity — not just keywords.',
    color: 'from-yellow-500 to-orange-600',
  },
  {
    icon: TrendingUp,
    title: 'Actionable Insights',
    description: 'Students receive specific improvement suggestions to become more competitive in the market.',
    color: 'from-cyan-500 to-blue-600',
  },
];

const stats = [
  { value: '10K+', label: 'Student Profiles' },
  { value: '500+', label: 'Startups Hiring' },
  { value: '95%', label: 'Match Accuracy' },
  { value: '< 2min', label: 'To Find Candidates' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero min-h-[90vh] flex items-center">
        {/* Background mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        <div className="container relative z-10 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <Badge variant="blue" className="mb-6 px-4 py-1.5 text-sm">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI-Powered Talent Discovery Platform
            </Badge>

            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Find the Best Talent
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Not Just Keywords
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-300">
              CareerVerse AI connects students with startups through AI-powered matching.
              Build your AI Talent Passport and get discovered by companies that value your real skills.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="gradient" size="xl" asChild className="shadow-xl shadow-blue-500/30">
                <Link href="/auth/register">
                  Get Your AI Passport
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="glass"
                size="xl"
                asChild
                className="border border-white/20 text-white"
              >
                <Link href="/search">
                  <Search className="mr-2 h-5 w-5" />
                  Discover Talent
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm"
              >
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </motion.div> */}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-background" id="features">
        <div className="container">
          <div className="mb-16 text-center">
            <Badge variant="blue" className="mb-4">Platform Features</Badge>
            <h2 className="text-4xl font-bold tracking-tight">
              Everything You Need to{' '}
              <span className="text-gradient">Hire Smarter</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Not just a job board. An AI-powered system that understands skills, projects, and potential.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="h-full group hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="p-6">
                    <div
                      className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color}`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="mb-16 text-center">
            <Badge variant="purple" className="mb-4">How It Works</Badge>
            <h2 className="text-4xl font-bold tracking-tight">
              From Profile to <span className="text-gradient">Placement</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* For Students */}
            <Card className="p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold">For Students</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Create your profile with skills, education & projects',
                  'Connect GitHub for automatic activity analysis',
                  'Upload resume — AI extracts and populates your data',
                  'Generate your AI Talent Passport in seconds',
                  'Get discovered by top startups and apply to internships',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ul>
              <Button variant="gradient" className="mt-8 w-full" asChild>
                <Link href="/auth/register?role=STUDENT">
                  Create Your Passport <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>

            {/* For Startups */}
            <Card className="p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold">For Startups</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Create your company profile and list internships',
                  'Search talent using natural language: "Find React interns"',
                  'View AI-ranked candidates with match scores',
                  'Explore full AI Talent Passports with skill breakdowns',
                  'Save candidates and manage applications in one place',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white" asChild>
                <Link href="/auth/register?role=STARTUP">
                  Start Hiring <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 to-transparent" />
        <div className="container relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to build your AI Talent Passport?
            </h2>
            <p className="text-slate-300 mb-8 text-lg max-w-xl mx-auto">
              Join thousands of students and hundreds of startups already on CareerVerse AI.
            </p>
            <Button variant="gradient" size="xl" asChild className="shadow-xl">
              <Link href="/auth/register">
                Get Started Free <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-background">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded gradient-primary">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold text-sm">CareerVerse AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 CareerVerse AI. AI-Powered Talent Discovery.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
