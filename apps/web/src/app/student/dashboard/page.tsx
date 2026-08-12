'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Zap, Github, FileText, User, CheckCircle2, ArrowRight,
  Briefcase, Star, TrendingUp, Code2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useDbUser } from '@/hooks/use-db-user';
import api from '@/lib/api';
import { getInitials, getScoreColor } from '@/lib/utils';
import type { Student, Application } from '@/types';

export default function StudentDashboardPage() {
  const { clerkUser } = useDbUser();

  const { data: student } = useQuery<Student>({
    queryKey: ['student-profile'],
    queryFn: () => api.get('/students/me').then((r) => r.data),
  });

  const { data: applications } = useQuery<Application[]>({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/internships/my/applications').then((r) => r.data),
  });

  const completionTasks = [
    { label: 'Profile info', done: !!(student?.name && student?.location && student?.bio), href: '/student/profile' },
    { label: 'Education details', done: !!(student?.college && student?.degree), href: '/student/profile#education' },
    { label: 'Skills added', done: (student?.programmingLangs?.length || 0) > 0, href: '/student/profile#skills' },
    { label: 'GitHub connected', done: !!student?.githubUsername, href: '/student/profile#links' },
    { label: 'Resume uploaded', done: !!student?.resumeUrl, href: '/student/profile#resume' },
    { label: 'Projects added', done: (student?.projects?.length || 0) > 0, href: '/student/profile#projects' },
    { label: 'AI Passport generated', done: !!student?.aiSummary, href: '/student/passport' },
  ];

  const completedCount = completionTasks.filter((t) => t.done).length;
  const completionPct = Math.round((completedCount / completionTasks.length) * 100);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {student?.name?.split(' ')[0] || clerkUser?.firstName || 'there'} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's your talent dashboard overview</p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/student/passport">
            <Zap className="mr-2 h-4 w-4" />
            View AI Passport
          </Link>
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            icon: TrendingUp,
            label: 'Profile Score',
            value: `${student?.profileScore || 0}%`,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
          {
            icon: Github,
            label: 'GitHub Score',
            value: student?.githubScore ? `${student.githubScore}` : '—',
            color: 'text-green-500',
            bg: 'bg-green-500/10',
          },
          {
            icon: Briefcase,
            label: 'Applications',
            value: applications?.length || 0,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
          },
          {
            icon: Code2,
            label: 'Projects',
            value: student?.projects?.length || 0,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Completion */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Profile Completion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {completedCount}/{completionTasks.length} tasks
                </span>
                <span className="font-semibold">{completionPct}%</span>
              </div>
              <Progress value={completionPct} indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-600" />
            </div>

            <div className="space-y-2">
              {completionTasks.map((task) => (
                <Link key={task.label} href={task.href}>
                  <div className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted transition-colors">
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 ${task.done ? 'text-green-500' : 'text-muted-foreground/40'}`}
                    />
                    <span className={`text-sm ${task.done ? 'line-through text-muted-foreground' : ''}`}>
                      {task.label}
                    </span>
                    {!task.done && <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Passport preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              AI Talent Passport
            </CardTitle>
          </CardHeader>
          <CardContent>
            {student?.aiSummary ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "{student.aiSummary}"
                </p>

                {student.aiSkillScores && Object.keys(student.aiSkillScores).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Skill Scores</p>
                    {Object.entries(student.aiSkillScores)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([skill, score]) => (
                        <div key={skill} className="flex items-center gap-3">
                          <span className="text-sm w-28 truncate">{skill}</span>
                          <Progress
                            value={score}
                            className="flex-1 h-1.5"
                            indicatorClassName={`${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          />
                          <span className={`text-xs font-semibold w-8 text-right ${getScoreColor(score)}`}>
                            {score}
                          </span>
                        </div>
                      ))}
                  </div>
                )}

                {student.aiStrengths && student.aiStrengths.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Strengths</p>
                    <div className="flex flex-wrap gap-2">
                      {student.aiStrengths.map((s) => (
                        <Badge key={s} variant="success" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button variant="outline" size="sm" asChild>
                  <Link href="/student/passport">View Full Passport <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <p className="font-medium mb-1">Generate Your AI Talent Passport</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Let AI analyze your profile and create your talent summary
                </p>
                <Button variant="gradient" size="sm" asChild>
                  <Link href="/student/passport">Generate Now</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Recent Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applications && applications.length > 0 ? (
              <div className="space-y-3">
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{app.internship?.position}</p>
                        <p className="text-xs text-muted-foreground">{app.internship?.company?.name}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        app.status === 'HIRED'
                          ? 'success'
                          : app.status === 'SHORTLISTED'
                          ? 'blue'
                          : app.status === 'REJECTED'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {app.status.toLowerCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <Briefcase className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">No applications yet</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/search">Browse Internships</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
