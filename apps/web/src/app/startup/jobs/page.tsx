'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Briefcase, Plus, Edit3, Trash2, X, Save, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import type { Internship } from '@/types';

const schema = z.object({
  position: z.string().min(1),
  description: z.string().min(10),
  skillsRequired: z.string().min(1),
  duration: z.string().min(1),
  stipend: z.string().optional(),
  location: z.string().optional(),
  workType: z.enum(['REMOTE', 'HYBRID', 'ONSITE']),
  openings: z.coerce.number().min(1),
});

type FormData = z.infer<typeof schema>;

export default function StartupJobsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: company } = useQuery<any>({
    queryKey: ['company-profile'],
    queryFn: () => api.get('/companies/me').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/internships', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
      setShowForm(false);
      toast({ title: 'Internship posted!', variant: 'success' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/internships/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
      toast({ title: 'Internship deleted', variant: 'success' });
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { workType: 'REMOTE', openings: 1 },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate({
      ...data,
      skillsRequired: data.skillsRequired.split(',').map((s) => s.trim()),
    });
    reset();
  };

  const jobs = company?.internships || [];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Job Postings</h1>
        <Button variant="gradient" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Post Internship
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">New Internship Posting</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Position Title *</label>
                <Input placeholder="e.g., Frontend Developer Intern" {...register('position')} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Description *</label>
                <textarea
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  {...register('description')}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Skills Required (comma-separated) *</label>
                <Input placeholder="React, TypeScript, Node.js" {...register('skillsRequired')} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Duration *</label>
                <Input placeholder="e.g., 3 months, 6 months" {...register('duration')} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Stipend</label>
                <Input placeholder="e.g., ₹15,000/month or Unpaid" {...register('stipend')} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Location</label>
                <Input placeholder="e.g., Bangalore, Remote" {...register('location')} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Work Type</label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...register('workType')}>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ONSITE">Onsite</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Openings</label>
                <Input type="number" min={1} {...register('openings')} />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <Button type="submit" variant="gradient" loading={createMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" /> Post Internship
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); reset(); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No internships posted yet</h3>
          <Button variant="gradient" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Post Your First Internship
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job: Internship) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{job.position}</h3>
                        <Badge variant={job.status === 'ACTIVE' ? 'success' : 'secondary'}>
                          {job.status.toLowerCase()}
                        </Badge>
                        <Badge variant={job.workType === 'REMOTE' ? 'blue' : 'secondary'}>
                          {job.workType.toLowerCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {job.skillsRequired.map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>⏱ {job.duration}</span>
                        {job.stipend && <span>💰 {job.stipend}</span>}
                        {job.location && <span>📍 {job.location}</span>}
                        <span>👥 {job.openings} opening{job.openings !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive ml-2"
                      onClick={() => deleteMutation.mutate(job.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
