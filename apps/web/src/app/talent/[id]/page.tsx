'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import {
  Zap, Github, Globe, Linkedin, MapPin, GraduationCap, ExternalLink,
  ArrowLeft, Star, Loader2, Code2, TrendingUp,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/lib/api';

import { getInitials, getScoreColor, getScoreBg } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Student } from '@/types';

export default function TalentProfilePage() {
  const { id } = useParams();
  const router = useRouter();


  const { data: student, isLoading } = useQuery<Student>({
    queryKey: ['student', id],
    queryFn: () => api.get(`/students/${id}`).then((r) => r.data),
  });

  const handleSave = async () => {
    if (!user || user.role !== 'STARTUP') {
      toast({ title: 'Login as startup to save', variant: 'destructive' });
      return;
    }
    try {
      await api.post(`/companies/me/saved-candidates/${id}`);
      toast({ title: 'Candidate saved!', variant: 'success' });
    } catch {
      toast({ title: 'Already saved', variant: 'destructive' });
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );

  if (!student) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-20 text-center">
        <p className="text-xl text-muted-foreground">Talent not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    </div>
  );

  const allSkills = [
    ...student.programmingLangs,
    ...student.frameworks,
    ...student.databases,
    ...student.cloudPlatforms,
    ...student.tools,
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-5xl">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
        </Button>

        {/* Hero */}
        <Card className="mb-6 overflow-hidden">
          <div className="gradient-primary h-32 relative">
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <CardContent className="p-6 -mt-16 relative">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div className="flex items-end gap-4">
                <Avatar className="h-24 w-24 ring-4 ring-background">
                  <AvatarImage src={student.avatarUrl} />
                  <AvatarFallback className="text-3xl gradient-primary text-white">
                    {getInitials(student.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="mb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{student.name}</h1>
                    {student.aiSummary && (
                      <Badge variant="blue" className="gap-1">
                        <Zap className="h-3 w-3" /> AI Passport
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {student.degree && `${student.degree} in ${student.branch}`}
                    {student.college && ` • ${student.college}`}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {student.location && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {student.location}
                      </span>
                    )}
                    {student.graduationYear && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" /> Class of {student.graduationYear}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {student.githubUsername && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://github.com/${student.githubUsername}`} target="_blank" rel="noreferrer">
                      <Github className="mr-1.5 h-4 w-4" /> GitHub
                    </a>
                  </Button>
                )}
                {student.linkedinUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={student.linkedinUrl} target="_blank" rel="noreferrer">
                      <Linkedin className="mr-1.5 h-4 w-4" /> LinkedIn
                    </a>
                  </Button>
                )}
                {user?.role === 'STARTUP' && (
                  <Button variant="gradient" size="sm" onClick={handleSave}>
                    <Star className="mr-1.5 h-4 w-4" /> Save
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="passport">
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="passport">AI Passport</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="github">GitHub</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>

          {/* AI Passport Tab */}
          <TabsContent value="passport" className="space-y-4">
            {student.aiSummary ? (
              <>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">AI Summary</p>
                    <p className="text-foreground leading-relaxed italic text-lg">"{student.aiSummary}"</p>
                  </CardContent>
                </Card>

                {student.aiSkillScores && Object.keys(student.aiSkillScores).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-primary" /> Skill Scores
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {Object.entries(student.aiSkillScores)
                          .sort(([, a], [, b]) => b - a)
                          .map(([skill, score]) => (
                            <div key={skill} className="flex items-center gap-3">
                              <span className="text-sm w-28 truncate">{skill}</span>
                              <Progress value={score} className="flex-1 h-2" indicatorClassName={getScoreBg(score)} />
                              <span className={`text-sm font-bold w-8 text-right ${getScoreColor(score)}`}>{score}</span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {student.aiStrengths && student.aiStrengths.length > 0 && (
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
                              <span className="text-green-500 mt-0.5">✓</span> {s}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  {student.aiImprovements && student.aiImprovements.length > 0 && (
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
                              <span className="text-blue-500 mt-0.5">→</span> {s}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">This student hasn't generated their AI Passport yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            {student.projects?.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {student.projects.map((p) => (
                  <Card key={p.id}>
                    <CardContent className="p-5">
                      <h3 className="font-semibold mb-1">{p.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{p.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {p.technologies.map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        {p.githubUrl && (
                          <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                            <Github className="h-3 w-3" /> Code
                          </a>
                        )}
                        {p.liveUrl && (
                          <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" /> Live
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No projects added yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* GitHub Tab */}
          <TabsContent value="github">
            {student.githubData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: 'Repositories', value: (student.githubData as any).publicRepos },
                    { label: 'Total Stars', value: (student.githubData as any).totalStars },
                    { label: 'Forks', value: (student.githubData as any).totalForks },
                    { label: 'Followers', value: (student.githubData as any).followers },
                  ].map((s) => (
                    <Card key={s.label}>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {(student.githubData as any).topRepos?.map((repo: any) => (
                  <Card key={repo.name}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{repo.name}</p>
                        {repo.description && <p className="text-sm text-muted-foreground">{repo.description}</p>}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        {repo.language && <Badge variant="secondary">{repo.language}</Badge>}
                        <span className="text-muted-foreground">⭐ {repo.stars}</span>
                        <a href={repo.url} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Github className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-muted-foreground">GitHub not connected</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <div className="space-y-4">
              {[
                { label: 'Programming Languages', skills: student.programmingLangs },
                { label: 'Frameworks', skills: student.frameworks },
                { label: 'Databases', skills: student.databases },
                { label: 'Cloud & DevOps', skills: student.cloudPlatforms },
                { label: 'Tools', skills: student.tools },
              ].filter((c) => c.skills?.length > 0).map((cat) => (
                <Card key={cat.label}>
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{cat.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.skills.map((s) => (
                        <Badge key={s} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
