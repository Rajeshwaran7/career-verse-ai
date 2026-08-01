import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [students, companies, internships, applications] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.company.count(),
      this.prisma.internship.count(),
      this.prisma.application.count(),
    ]);
    return { students, companies, internships, applications };
  }

  async listUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: { id: true, email: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { users, total };
  }

  async listStudents(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        skip,
        take: limit,
        include: { user: { select: { email: true, isActive: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count(),
    ]);
    return { students, total };
  }

  async listCompanies(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { email: true } },
          _count: { select: { internships: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.company.count(),
    ]);
    return { companies, total };
  }

  async deactivateUser(userId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { isActive: false } });
  }

  async activateUser(userId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { isActive: true } });
  }
}
