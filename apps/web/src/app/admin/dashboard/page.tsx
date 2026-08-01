'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Building2, Briefcase, FileText, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

export default function AdminDashboardPage() {
  const { data: stats } = useQuery<{
    students: number; companies: number; internships: number; applications: number;
  }>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data),
  });

  const { data: recentStudents } = useQuery<any>({
    queryKey: ['admin-students'],
    queryFn: () => api.get('/admin/students?limit=5').then((r) => r.data),
  });

  const { data: recentCompanies } = useQuery<any>({
    queryKey: ['admin-companies'],
    queryFn: () => api.get('/admin/companies?limit=5').then((r) => r.data),
  });

  const statCards = [
    { label: 'Total Students', value: stats?.students || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Companies', value: stats?.companies || 0, icon: Building2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Internships', value: stats?.internships || 0, icon: Briefcase, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Applications', value: stats?.applications || 0, icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Students */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Recent Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentStudents?.students?.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.user?.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.profileCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {s.profileCompleted ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Recent Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCompanies?.companies?.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.industry} • {c._count?.internships} postings</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.isVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {c.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
