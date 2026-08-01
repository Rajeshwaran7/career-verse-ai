import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanyDto } from './companies.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { userId },
      include: { internships: { orderBy: { createdAt: 'desc' } } },
    });
    if (!company) throw new NotFoundException('Company profile not found');
    return company;
  }

  async getById(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { internships: { where: { status: 'ACTIVE' } } },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async updateProfile(userId: string, dto: UpdateCompanyDto) {
    return this.prisma.company.update({ where: { userId }, data: dto });
  }

  async saveCandidate(userId: string, studentId: string, notes?: string) {
    const company = await this.prisma.company.findUnique({ where: { userId } });
    if (!company) throw new NotFoundException();
    return this.prisma.savedCandidate.upsert({
      where: { companyId_studentId: { companyId: company.id, studentId } },
      update: { notes },
      create: { companyId: company.id, studentId, notes },
    });
  }

  async removeSavedCandidate(userId: string, studentId: string) {
    const company = await this.prisma.company.findUnique({ where: { userId } });
    if (!company) throw new NotFoundException();
    const saved = await this.prisma.savedCandidate.findUnique({
      where: { companyId_studentId: { companyId: company.id, studentId } },
    });
    if (!saved) throw new NotFoundException();
    await this.prisma.savedCandidate.delete({
      where: { companyId_studentId: { companyId: company.id, studentId } },
    });
    return { message: 'Candidate removed from saved list' };
  }

  async getSavedCandidates(userId: string) {
    const company = await this.prisma.company.findUnique({ where: { userId } });
    if (!company) throw new NotFoundException();
    return this.prisma.savedCandidate.findMany({
      where: { companyId: company.id },
      include: { student: { include: { projects: { take: 2 } } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
