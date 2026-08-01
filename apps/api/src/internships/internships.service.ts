import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInternshipDto, UpdateInternshipDto } from './internships.dto';

@Injectable()
export class InternshipsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateInternshipDto) {
    const company = await this.prisma.company.findUnique({ where: { userId } });
    if (!company) throw new NotFoundException('Company not found');
    return this.prisma.internship.create({ data: { ...dto, companyId: company.id } });
  }

  async findAll(page = 1, limit = 20, filters?: { workType?: string; skills?: string[] }) {
    const skip = (page - 1) * limit;
    const where: any = { status: 'ACTIVE' };
    if (filters?.workType) where.workType = filters.workType;
    if (filters?.skills?.length) {
      where.skillsRequired = { hasSome: filters.skills };
    }
    const [internships, total] = await Promise.all([
      this.prisma.internship.findMany({
        skip,
        take: limit,
        where,
        include: { company: { select: { name: true, logoUrl: true, industry: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.internship.count({ where }),
    ]);
    return { internships, total, page, limit };
  }

  async findOne(id: string) {
    const internship = await this.prisma.internship.findUnique({
      where: { id },
      include: {
        company: true,
        _count: { select: { applications: true } },
      },
    });
    if (!internship) throw new NotFoundException('Internship not found');
    return internship;
  }

  async update(userId: string, id: string, dto: Partial<UpdateInternshipDto>) {
    const company = await this.prisma.company.findUnique({ where: { userId } });
    if (!company) throw new NotFoundException();
    const internship = await this.prisma.internship.findUnique({ where: { id } });
    if (!internship) throw new NotFoundException();
    if (internship.companyId !== company.id) throw new ForbiddenException();
    return this.prisma.internship.update({ where: { id }, data: dto });
  }

  async delete(userId: string, id: string) {
    const company = await this.prisma.company.findUnique({ where: { userId } });
    if (!company) throw new NotFoundException();
    const internship = await this.prisma.internship.findUnique({ where: { id } });
    if (!internship || internship.companyId !== company.id) throw new ForbiddenException();
    await this.prisma.internship.delete({ where: { id } });
    return { message: 'Internship deleted' };
  }

  async apply(userId: string, internshipId: string, coverLetter?: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Student not found');
    return this.prisma.application.upsert({
      where: { studentId_internshipId: { studentId: student.id, internshipId } },
      update: {},
      create: { studentId: student.id, internshipId, coverLetter },
    });
  }

  async getMyApplications(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException();
    return this.prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        internship: {
          include: { company: { select: { name: true, logoUrl: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getApplicationsForInternship(userId: string, internshipId: string) {
    const company = await this.prisma.company.findUnique({ where: { userId } });
    if (!company) throw new NotFoundException();
    const internship = await this.prisma.internship.findUnique({ where: { id: internshipId } });
    if (!internship || internship.companyId !== company.id) throw new ForbiddenException();
    return this.prisma.application.findMany({
      where: { internshipId },
      include: { student: { include: { projects: { take: 2 } } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
