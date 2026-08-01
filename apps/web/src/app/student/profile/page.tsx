'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  User, GraduationCap, Code2, Github, Linkedin, Globe, FileText,
  Plus, Trash2, ExternalLink, Upload, Loader2, Edit3, Save, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/utils';
import type { Student, Project } from '@/types';

const SKILL_CATEGORIES = [
  { key: 'programmingLangs', label: 'Programming Languages', placeholder: 'JavaScript, Python, Go…' },
  { key: 'frameworks', label: 'Frameworks & Libraries', placeholder: 'React, Node.js, Django…' },
  { key: 'databases', label: 'Databases', placeholder: 'PostgreSQL, MongoDB, Redis…' },
  { key: 'cloudPlatforms', label: 'Cloud & DevOps', placeholder: 'AWS, Docker, Kubernetes…' },
  { key: 'tools', label: 'Tools', placeholder: 'Git, Figma, VS Code…' },
];

export default function StudentProfilePage() {
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSkills, setNewSkills] = useState<Record<string, string>>({});
  const [showAddProject, setShowAddProject] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const { data: student, isLoading } = useQuery<Student>({
    queryKey: ['student-profile'],
    queryFn: () => api.get('/students/me').then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put('/students/me', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      setEditingSection(null);
      toast({ title: 'Profile updated', variant: 'success' });
    },
    onError: () => toast({ title: 'Update failed', variant: 'destructive' }),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/students/me/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast({ title: 'Project deleted', variant: 'success' });
    },
  });

  const connectGitHubMutation = useMutation({
    mutationFn: (username: string) => api.post('/github/connect', { username }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast({ title: 'GitHub connected!', variant: 'success' });
    },
    onError: () => toast({ title: 'Could not connect GitHub. Check username.', variant: 'destructive' }),
  });

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast({ title: 'Resume uploaded and AI is parsing it!', variant: 'success' });
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploadingResume(false);
    }
  };

  const addSkill = (category: string) => {
    const val = newSkills[category]?.trim();
    if (!val) return;
    const current = (student as any)?.[category] || [];
    if (!current.includes(val)) {
      updateMutation.mutate({ [category]: [...current, val] });
    }
    setNewSkills((p) => ({ ...p, [category]: '' }));
  };

  const removeSkill = (category: string, skill: string) => {
    const current = (student as any)?.[category] || [];
    updateMutation.mutate({ [category]: current.filter((s: string) => s !== skill) });
  };

  if (isLoading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Badge variant="blue">Profile Score: {student?.profileScore || 0}%</Badge>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="w-full">
          <TabsTrigger value="personal" className="flex-1">Personal</TabsTrigger>
          <TabsTrigger value="education" className="flex-1">Education</TabsTrigger>
          <TabsTrigger value="skills" className="flex-1">Skills</TabsTrigger>
          <TabsTrigger value="projects" className="flex-1">Projects</TabsTrigger>
          <TabsTrigger value="links" className="flex-1">Links</TabsTrigger>
        </TabsList>

        {/* Personal */}
        <TabsContent value="personal">
          <PersonalSection student={student} updateMutation={updateMutation} handleResumeUpload={handleResumeUpload} uploadingResume={uploadingResume} />
        </TabsContent>

        {/* Education */}
        <TabsContent value="education">
          <EducationSection student={student} updateMutation={updateMutation} />
        </TabsContent>

        {/* Skills */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" /> Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {SKILL_CATEGORIES.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-sm font-medium mb-2 block">{label}</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {((student as any)?.[key] || []).map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                        {skill}
                        <button onClick={() => removeSkill(key, skill)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={placeholder}
                      value={newSkills[key] || ''}
                      onChange={(e) => setNewSkills((p) => ({ ...p, [key]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && addSkill(key)}
                      className="h-8 text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={() => addSkill(key)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects */}
        <TabsContent value="projects">
          <div className="space-y-4">
            {student?.projects?.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={(id) => deleteProjectMutation.mutate(id)} />
            ))}
            {showAddProject ? (
              <AddProjectForm
                onSubmit={(data) => {
                  api.post('/students/me/projects', data).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['student-profile'] });
                    setShowAddProject(false);
                    toast({ title: 'Project added!', variant: 'success' });
                  });
                }}
                onCancel={() => setShowAddProject(false)}
              />
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setShowAddProject(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Project
              </Button>
            )}
          </div>
        </TabsContent>

        {/* Links */}
        <TabsContent value="links">
          <LinksSection student={student} updateMutation={updateMutation} connectGitHubMutation={connectGitHubMutation} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-components

function PersonalSection({ student, updateMutation, handleResumeUpload, uploadingResume }: any) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: student?.name || '',
    phone: student?.phone || '',
    location: student?.location || '',
    bio: student?.bio || '',
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4 w-4 text-primary" /> Personal Information
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
          {editing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={student?.avatarUrl} />
            <AvatarFallback className="text-xl gradient-primary text-white">
              {student?.name ? getInitials(student.name) : 'S'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg">{student?.name}</p>
            <p className="text-sm text-muted-foreground">{student?.college}</p>
          </div>
        </div>

        {editing ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { key: 'name', label: 'Full Name', type: 'text' },
              { key: 'phone', label: 'Phone', type: 'tel' },
              { key: 'location', label: 'Location', type: 'text' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                <Input
                  type={type}
                  value={(form as any)[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Bio</label>
              <textarea
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
              />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <Button size="sm" variant="gradient" onClick={() => { updateMutation.mutate(form); setEditing(false); }}>
                <Save className="mr-1 h-3 w-3" /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-2 text-sm">
            {student?.bio && <p className="text-muted-foreground">{student.bio}</p>}
            {student?.phone && <p><span className="font-medium">Phone:</span> {student.phone}</p>}
            {student?.location && <p><span className="font-medium">Location:</span> {student.location}</p>}
          </div>
        )}

        {/* Resume upload */}
        <div className="mt-4 border-t border-border pt-4">
          <label className="text-sm font-medium flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-primary" /> Resume
          </label>
          {student?.resumeUrl ? (
            <div className="flex items-center gap-3">
              <Badge variant="success">Uploaded</Badge>
              <a href={student.resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                View Resume <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : null}
          <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border p-3 hover:border-primary transition-colors">
            {uploadingResume ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Upload className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">
              {uploadingResume ? 'Uploading…' : 'Upload PDF Resume (max 5MB)'}
            </span>
            <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
          </label>
        </div>
      </CardContent>
    </Card>
  );
}

function EducationSection({ student, updateMutation }: any) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    college: student?.college || '',
    degree: student?.degree || '',
    branch: student?.branch || '',
    graduationYear: student?.graduationYear || '',
    cgpa: student?.cgpa || '',
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" /> Education
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
          {editing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { key: 'college', label: 'College / University' },
              { key: 'degree', label: 'Degree' },
              { key: 'branch', label: 'Branch / Major' },
              { key: 'graduationYear', label: 'Graduation Year', type: 'number' },
              { key: 'cgpa', label: 'CGPA / GPA', type: 'number' },
            ].map(({ key, label, type = 'text' }) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                <Input
                  type={type}
                  value={(form as any)[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="sm:col-span-2 flex gap-2">
              <Button size="sm" variant="gradient" onClick={() => { updateMutation.mutate(form); setEditing(false); }}>
                <Save className="mr-1 h-3 w-3" /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            {student?.college ? (
              <>
                <p className="font-medium text-base">{student.college}</p>
                {student.degree && <p className="text-muted-foreground">{student.degree} {student.branch && `in ${student.branch}`}</p>}
                <div className="flex gap-4">
                  {student.graduationYear && <span>Class of {student.graduationYear}</span>}
                  {student.cgpa && <span>CGPA: {student.cgpa}</span>}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No education details added yet</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project, onDelete }: { project: Project; onDelete: (id: string) => void }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">{project.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
              ))}
            </div>
            <div className="flex gap-3 mt-3">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                  <Github className="h-3 w-3" /> GitHub
                </a>
              )}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                  <ExternalLink className="h-3 w-3" /> Live Demo
                </a>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive shrink-0"
            onClick={() => onDelete(project.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  technologies: z.string().min(1),
  githubUrl: z.string().optional(),
  liveUrl: z.string().optional(),
});

function AddProjectForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const { register, handleSubmit } = useForm({ resolver: zodResolver(projectSchema) });
  return (
    <Card>
      <CardContent className="p-5">
        <form
          onSubmit={handleSubmit((data) =>
            onSubmit({ ...data, technologies: data.technologies.split(',').map((t: string) => t.trim()) }),
          )}
          className="space-y-3"
        >
          <Input placeholder="Project title" {...register('title')} />
          <textarea
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[70px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Project description"
            {...register('description')}
          />
          <Input placeholder="Technologies (comma-separated)" {...register('technologies')} />
          <Input placeholder="GitHub URL (optional)" {...register('githubUrl')} />
          <Input placeholder="Live demo URL (optional)" {...register('liveUrl')} />
          <div className="flex gap-2">
            <Button type="submit" size="sm" variant="gradient">Add Project</Button>
            <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function LinksSection({ student, updateMutation, connectGitHubMutation }: any) {
  const [githubUsername, setGithubUsername] = useState(student?.githubUsername || '');
  const [links, setLinks] = useState({
    linkedinUrl: student?.linkedinUrl || '',
    portfolioUrl: student?.portfolioUrl || '',
  });

  return (
    <div className="space-y-4">
      {/* GitHub */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Github className="h-4 w-4" /> GitHub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="your-github-username"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
            />
            <Button
              variant="gradient"
              onClick={() => connectGitHubMutation.mutate(githubUsername)}
              loading={connectGitHubMutation.isPending}
            >
              {student?.githubUsername ? 'Update' : 'Connect'}
            </Button>
          </div>
          {student?.githubData && (
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span>⭐ {(student.githubData as any).totalStars} stars</span>
              <span>📦 {(student.githubData as any).publicRepos} repos</span>
              <span>GitHub Score: <span className="text-primary font-medium">{student.githubScore}</span></span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Other Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Linkedin className="h-3 w-3" /> LinkedIn URL
            </label>
            <Input
              placeholder="https://linkedin.com/in/yourprofile"
              value={links.linkedinUrl}
              onChange={(e) => setLinks((p) => ({ ...p, linkedinUrl: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Globe className="h-3 w-3" /> Portfolio Website
            </label>
            <Input
              placeholder="https://yourportfolio.com"
              value={links.portfolioUrl}
              onChange={(e) => setLinks((p) => ({ ...p, portfolioUrl: e.target.value }))}
            />
          </div>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => updateMutation.mutate(links)}
            loading={updateMutation.isPending}
          >
            <Save className="mr-1 h-3 w-3" /> Save Links
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
