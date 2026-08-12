'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Zap, Loader2, ChevronLeft, ChevronRight,
  MapPin, GraduationCap, Github, Star, Eye, X,
} from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { useDbUser } from '@/hooks/use-db-user';
import { getInitials, getScoreColor, truncate } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Student, SearchResult } from '@/types';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR + i - 1);

export default function SearchPage() {
  const { isSignedIn } = useAuth();
  const { dbUser } = useDbUser();
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [location, setLocation] = useState('');
  const [college, setCollege] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useQuery<SearchResult>({
    queryKey: ['student-search', submittedQuery, location, college, gradYear, page],
    queryFn: () =>
      api.get('/search/students', {
        params: {
          query: submittedQuery || undefined,
          location: location || undefined,
          college: college || undefined,
          graduationYear: gradYear || undefined,
          page,
          limit: 12,
        },
      }).then((r) => r.data),
    enabled: true,
  });

  const handleSearch = () => {
    setPage(1);
    setSubmittedQuery(query);
  };

  const handleSave = async (studentId: string) => {
    if (!isSignedIn || dbUser?.role !== 'STARTUP') {
      toast({ title: 'Login as a startup to save candidates', variant: 'destructive' });
      return;
    }
    setSavingId(studentId);
    try {
      await api.post(`/companies/me/saved-candidates/${studentId}`);
      toast({ title: 'Candidate saved!', variant: 'success' });
    } catch {
      toast({ title: 'Already saved or error occurred', variant: 'destructive' });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 max-w-7xl">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Discover <span className="text-gradient">Top Talent</span>
          </h1>
          <p className="text-muted-foreground">
            Use natural language to find the perfect candidates for your team
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-card text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder='Try "React developers in Mumbai" or "Node.js backend interns"'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              {query && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => { setQuery(''); setSubmittedQuery(''); }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button variant="gradient" className="h-12 px-6" onClick={handleSearch}>
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">Search</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 px-4"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 grid gap-3 sm:grid-cols-3"
              >
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Location</label>
                  <Input placeholder="City or country" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">College</label>
                  <Input placeholder="College name" value={college} onChange={(e) => setCollege(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Graduation Year</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                  >
                    <option value="">Any year</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Search pill */}
        {submittedQuery && (
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="blue" className="gap-1 px-3 py-1">
              <Zap className="h-3 w-3" /> AI Search: "{submittedQuery}"
            </Badge>
            <span className="text-sm text-muted-foreground">
              {data?.total || 0} results ranked by AI
            </span>
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-2 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-muted rounded" />
                  <div className="h-2 bg-muted rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.students?.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No candidates found</h3>
            <p className="text-muted-foreground">Try a different search query or adjust filters</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data?.students?.map((student, i) => (
              <CandidateCard
                key={student.id}
                student={student}
                index={i}
                onSave={() => handleSave(student.id)}
                isSaving={savingId === student.id}
                showSave={!!(isSignedIn && dbUser?.role === 'STARTUP')}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {data.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CandidateCard({
  student, index, onSave, isSaving, showSave,
}: {
  student: Student;
  index: number;
  onSave: () => void;
  isSaving: boolean;
  showSave: boolean;
}) {
  const allSkills = [...(student.programmingLangs || []), ...(student.frameworks || [])];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="h-full flex flex-col hover:border-primary/50 hover:shadow-md transition-all group">
        <CardContent className="p-4 flex flex-col h-full">
          {/* Avatar + name */}
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-12 w-12 ring-2 ring-border group-hover:ring-primary/30 transition-all">
              <AvatarImage src={student.avatarUrl} />
              <AvatarFallback className="gradient-primary text-white text-sm">
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{student.name}</p>
              {student.college && (
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  <GraduationCap className="h-3 w-3 shrink-0" />
                  {student.college}
                </p>
              )}
              {student.location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {student.location}
                </p>
              )}
            </div>
          </div>

          {/* Match score */}
          {student.matchScore !== undefined && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Match Score</span>
                <span className={`font-bold ${getScoreColor(student.matchScore)}`}>
                  {student.matchScore}%
                </span>
              </div>
              <Progress
                value={student.matchScore}
                className="h-1.5"
                indicatorClassName={
                  student.matchScore >= 80 ? 'bg-green-500' :
                  student.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }
              />
            </div>
          )}

          {/* AI Summary */}
          {student.aiSummary && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 italic">
              "{truncate(student.aiSummary, 80)}"
            </p>
          )}

          {/* Skills */}
          <div className="flex flex-wrap gap-1 mb-3 flex-1">
            {allSkills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
            ))}
            {allSkills.length > 5 && (
              <Badge variant="outline" className="text-xs">+{allSkills.length - 5}</Badge>
            )}
          </div>

          {/* Bottom row */}
          <div className="flex items-center gap-2 mt-auto">
            {student.githubScore && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Github className="h-3 w-3" />
                <span>{student.githubScore}</span>
              </div>
            )}
            <div className="ml-auto flex gap-1.5">
              {showSave && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => { e.preventDefault(); onSave(); }}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Star className="h-3 w-3" />}
                </Button>
              )}
              <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                <Link href={`/talent/${student.id}`}>
                  <Eye className="mr-1 h-3 w-3" /> View
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
