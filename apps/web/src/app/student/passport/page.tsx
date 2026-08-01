'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, RefreshCw, Star, TrendingUp, Lightbulb, Github,
  Globe, Linkedin, ExternalLink, Code2, Award, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { getInitials, getScoreColor, getScoreBg } from '@/lib/utils';
import type { Student } from '@/types';

export default function StudentPassportPage() {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  const { data: student, isLoading } = useQuery<Student>({
    queryKey: ['student-profile'],
    queryFn: () => api.get('/students/me').then((r) => r.data),
  });

  const generatePassport = async () => {
    setGenerating(true);
    try {
      await api.post('/ai/passport/generate');
      await queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast({ title: '✨ AI Passport generated!', variant: 'success' });
    } catch {
      toast({ title: 'Failed to generate passport', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const allSkills = [
    ...(student?.programmingLangs || []),
    ...(student?.frameworks || []),
    ...(student?.databases || []),
    ...(student?.cloudPlatforms || []),
    ...(student?.tools || []),
  ];

  const hasPassport = !!student?.aiSummary;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            AI Talent Passport
          </h1>
          <p className="text-muted-foreground mt-1">Your AI-generated professional identity</p>
        </div>
        <Button
          variant="gradient"
          onClick={generatePassport}
          loading={generating}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
          {hasPassport ? 'Regenerate' : 'Generate Passport'}
        </Button>
      </div>

      {!hasPassport && !generating && (
        <Card className="border-dashed border-2 border-primary/30">
          <CardContent className="py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary mx-auto mb-4">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Generate Your AI Talent Passport</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Our AI will analyze your profile, skills, projects, and GitHub activity to create
              a comprehensive talent summary that helps you stand out to recruiters.
            </p>
            <Button variant="gradient" size="lg" onClick={generatePassport} loading={generating}>
              <Zap className="mr-2 h-5 w-5" />
              Generate Passport Now
            </Button>
          </CardContent>
        </Card>
      )}

      {generating && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary mx-auto mb-4 animate-pulse">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <p className="text-lg font-medium">AI is analyzing your profile…</p>
            <p className="text-sm text-muted-foreground mt-1">This takes 10-20 seconds</p>
          </CardContent>
        </Card>
      )}

      <AnimatePresence>
        {hasPassport && !generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Passport Card */}
            <Card className="overflow-hidden border-primary/20">
              <div className="gradient-primary h-2" />
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20 ring-4 ring-primary/20">
                    <AvatarImage src={student?.avatarUrl} />
                    <AvatarFallback className="text-2xl gradient-primary text-white">
                      {student?.name ? getInitials(student.name) : 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold">{student?.name}</h2>
                      <Badge variant="blue" className="gap-1">
                        <Zap className="h-3 w-3" /> AI Verified
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {student?.degree && `${student.degree} in ${student.branch}`}
                      {student?.college && ` • ${student.college}`}
                      {student?.graduationYear && ` • Class of ${student.graduationYear}`}
                    </p>
                    <div className="flex gap-3 mt-2">
                      {student?.githubUsername && (
                        <a href={`https://github.com/${student.githubUsername}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                          <Github className="h-3 w-3" /> @{student.githubUsername}
                        </a>
                      )}
                      {student?.linkedinUrl && (
                        <a href={student.linkedinUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                          <Linkedin className="h-3 w-3" /> LinkedIn
                        </a>
                      )}
                      {student?.portfolioUrl && (
                        <a href={student.portfolioUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                          <Globe className="h-3 w-3" /> Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="mt-5 rounded-xl bg-muted/50 p-4 border border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wide text-xs">AI Summary</p>
                  <p className="text-foreground leading-relaxed italic">"{student?.aiSummary}"</p>
                </div>
              </CardContent>
            </Card>

            {/* Skill Scores */}
            {student?.aiSkillScores && Object.keys(student.aiSkillScores).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-primary" /> Skill Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(student.aiSkillScores)
                      .sort(([, a], [, b]) => b - a)
                      .map(([skill, score]) => (
                        <div key={skill} className="flex items-center gap-4">
                          <span className="text-sm font-medium w-32 truncate">{skill}</span>
                          <Progress
                            value={score}
                            className="flex-1 h-2"
                            indicatorClassName={getScoreBg(score)}
                          />
                          <span className={`text-sm font-bold w-8 text-right ${getScoreColor(score)}`}>
                            {score}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {/* Strengths */}
              {student?.aiStrengths && student.aiStrengths.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" /> Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {student.aiStrengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 mt-0.5">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Improvements */}
              {student?.aiImprovements && student.aiImprovements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" /> Growth Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {student.aiImprovements.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-500 mt-0.5">→</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* GitHub Stats */}
            {student?.githubData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Github className="h-4 w-4" /> GitHub Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                      { label: 'Repositories', value: (student.githubData as any).publicRepos },
                      { label: 'Total Stars', value: (student.githubData as any).totalStars },
                      { label: 'Forks', value: (student.githubData as any).totalForks },
                      { label: 'Followers', value: (student.githubData as any).followers },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl bg-muted p-3 text-center">
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Language breakdown */}
                  {Object.keys((student.githubData as any).languages || {}).length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Languages Used</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries((student.githubData as any).languages)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 8)
                          .map(([lang, count]) => (
                            <Badge key={lang} variant="secondary">
                              {lang} ({count as number})
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Top repos */}
                  {(student.githubData as any).topRepos?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Top Repositories</p>
                      <div className="space-y-2">
                        {(student.githubData as any).topRepos.slice(0, 4).map((repo: any) => (
                          <a
                            key={repo.name}
                            href={repo.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between rounded-lg border border-border p-3 hover:border-primary transition-colors"
                          >
                            <div>
                              <p className="text-sm font-medium">{repo.name}</p>
                              {repo.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-xs">{repo.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {repo.language && <Badge variant="secondary" className="text-xs">{repo.language}</Badge>}
                              <span>⭐ {repo.stars}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Projects */}
            {student?.projects && student.projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Portfolio Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {student.projects.map((project) => (
                      <div key={project.id} className="rounded-xl border border-border p-4">
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((t) => (
                            <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                          ))}
                        </div>
                        <div className="flex gap-3 mt-2">
                          {project.githubUrl && (
                            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                              <Github className="h-3 w-3" /> Code
                            </a>
                          )}
                          {project.liveUrl && (
                            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" /> Demo
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {student?.aiPassportUpdatedAt && (
              <p className="text-xs text-center text-muted-foreground">
                Last generated: {new Date(student.aiPassportUpdatedAt).toLocaleString()}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
