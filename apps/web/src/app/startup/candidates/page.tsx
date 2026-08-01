'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Star, Trash2, ArrowRight, GraduationCap, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/utils';

export default function SavedCandidatesPage() {
  const queryClient = useQueryClient();

  const { data: saved, isLoading } = useQuery<any[]>({
    queryKey: ['saved-candidates'],
    queryFn: () => api.get('/companies/me/saved-candidates').then((r) => r.data),
  });

  const removeMutation = useMutation({
    mutationFn: (studentId: string) => api.delete(`/companies/me/saved-candidates/${studentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-candidates'] });
      toast({ title: 'Candidate removed', variant: 'success' });
    },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Saved Candidates</h1>
          <p className="text-muted-foreground mt-1">{saved?.length || 0} saved</p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/startup/search">Find More Talent</Link>
        </Button>
      </div>

      {!isLoading && (!saved || saved.length === 0) ? (
        <div className="text-center py-16">
          <Star className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No saved candidates yet</h3>
          <p className="text-muted-foreground mb-4">Start saving interesting candidates from your search</p>
          <Button variant="gradient" asChild>
            <Link href="/startup/search">Search Talent</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {saved?.map((item) => (
            <Card key={item.id} className="hover:border-primary/50 transition-all">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={item.student?.avatarUrl} />
                    <AvatarFallback className="gradient-primary text-white text-sm">
                      {getInitials(item.student?.name || 'S')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.student?.name}</p>
                    {item.student?.college && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" /> {item.student.college}
                      </p>
                    )}
                    {item.student?.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {item.student.location}
                      </p>
                    )}
                  </div>
                </div>

                {item.student?.aiSummary && (
                  <p className="text-xs text-muted-foreground mt-3 italic line-clamp-2">
                    "{item.student.aiSummary}"
                  </p>
                )}

                <div className="flex flex-wrap gap-1 mt-3">
                  {[...(item.student?.programmingLangs || []), ...(item.student?.frameworks || [])].slice(0, 4).map((s: string) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>

                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/talent/${item.student?.id}`}>
                      <ArrowRight className="mr-1 h-3 w-3" /> View Profile
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeMutation.mutate(item.student?.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
