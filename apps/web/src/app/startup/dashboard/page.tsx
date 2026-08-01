'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Briefcase, Search, Star, Users, Plus, ArrowRight, Building2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/lib/api';
import { getInitials } from '@/lib/utils';
import type { Company, Student, Internship } from '@/types';

export default function StartupDashboardPage() {
  const { data: company } = useQuery<Company>({
    queryKey: ['company-profile'],
    queryFn: () => api.get('/companies/me').then((r) => r.data),
  });

  const { data: savedCandidates } = useQuery<any[]>({
    queryKey: ['saved-candidates'],
    queryFn: () => api.get('/companies/me/saved-candidates').then((r) => r.data),
  });

  const { data: recommended } = useQuery<Student[]>({
    queryKey: ['recommended-students'],
    queryFn: () => api.get('/search/recommendations').then((r) => r.data),
  });

  const activeJobs = company?.internships?.filter((j) => j.status === 'ACTIVE') || [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {company?.name} 👋</h1>
          <p className="text-muted-foreground mt-1">Find the right talent for your team</p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/startup/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            Post Internship
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Briefcase, label: 'Active Postings', value: activeJobs.length, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { icon: Star, label: 'Saved Candidates', value: savedCandidates?.length || 0, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { icon: Users, label: 'Total Applications', value: '—', color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { icon: TrendingUp, label: 'Profile Views', value: '—', color: 'text-green-500', bg: 'bg-green-500/10' },
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Job Postings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" /> Active Postings
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/startup/jobs">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activeJobs.length > 0 ? (
              <div className="space-y-3">
                {activeJobs.slice(0, 4).map((job) => (
                  <div key={job.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium text-sm">{job.position}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={job.workType === 'REMOTE' ? 'success' : 'secondary'} className="text-xs">
                          {job.workType.toLowerCase()}
                        </Badge>
                        {job.stipend && <span className="text-xs text-muted-foreground">{job.stipend}</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/startup/jobs/${job.id}`}><ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Briefcase className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No active postings</p>
                <Button variant="gradient" size="sm" className="mt-3" asChild>
                  <Link href="/startup/jobs/new">Post Your First Internship</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved Candidates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" /> Saved Candidates
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/startup/candidates">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {savedCandidates && savedCandidates.length > 0 ? (
              <div className="space-y-3">
                {savedCandidates.slice(0, 4).map((saved) => (
                  <div key={saved.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={saved.student?.avatarUrl} />
                      <AvatarFallback className="gradient-primary text-white text-xs">
                        {getInitials(saved.student?.name || 'S')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{saved.student?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{saved.student?.college}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/talent/${saved.student?.id}`}><ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Star className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No saved candidates yet</p>
                <Button variant="gradient" size="sm" className="mt-3" asChild>
                  <Link href="/startup/search">Search Talent</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Recommended Students */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Recommended Talent
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/startup/search">Find More</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recommended && recommended.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recommended.slice(0, 6).map((s) => (
                  <Link key={s.id} href={`/talent/${s.id}`}>
                    <div className="rounded-xl border border-border p-4 hover:border-primary transition-all hover:shadow-sm cursor-pointer">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={s.avatarUrl} />
                          <AvatarFallback className="gradient-primary text-white text-sm">
                            {getInitials(s.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{s.college}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {[...s.programmingLangs, ...s.frameworks].slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">Post internships to get recommendations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
