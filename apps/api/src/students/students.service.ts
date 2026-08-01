import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStudentDto, CreateProjectDto, CreateExperienceDto } from './students.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: { projects: true, experiences: true },
    });
    if (!student) throw new NotFoundException('Student profile not found');
    return student;
  }

  async getStudentById(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { projects: true, experiences: true },
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async updateProfile(userId: string, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Student profile not found');

    const updated = await this.prisma.student.update({
      where: { userId },
      data: { ...dto },
    });

    // Recalculate profile completion score
    await this.updateProfileScore(updated.id);
    return this.prisma.student.findUnique({ where: { id: updated.id } });
  }

  async updateProfileScore(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { projects: true, experiences: true },
    });
    if (!student) return;

    let score = 0;
    if (student.name) score += 10;
    if (student.bio) score += 5;
    if (student.phone) score += 5;
    if (student.location) score += 5;
    if (student.college && student.degree) score += 10;
    if (student.githubUsername) score += 10;
    if (student.linkedinUrl) score += 5;
    if (student.resumeUrl) score += 10;
    if (student.projects.length > 0) score += 15;
    if (student.experiences.length > 0) score += 5;
    const totalSkills = [
      ...student.programmingLangs,
      ...student.frameworks,
      ...student.databases,
    ].length;
    score += Math.min(totalSkills * 2, 20);

    await this.prisma.student.update({
      where: { id: studentId },
      data: { profileScore: Math.min(score, 100), profileCompleted: score >= 60 },
    });
  }

  // Projects
  async createProject(userId: string, dto: CreateProjectDto) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Student not found');
    const project = await this.prisma.project.create({
      data: { ...dto, studentId: student.id },
    });
    await this.updateProfileScore(student.id);
    return project;
  }

  async updateProject(userId: string, projectId: string, dto: Partial<CreateProjectDto>) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException();
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.studentId !== student.id) throw new ForbiddenException();
    return this.prisma.project.update({ where: { id: projectId }, data: dto });
  }

  async deleteProject(userId: string, projectId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException();
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.studentId !== student.id) throw new ForbiddenException();
    await this.prisma.project.delete({ where: { id: projectId } });
    await this.updateProfileScore(student.id);
    return { message: 'Project deleted' };
  }

  // Experience
  async createExperience(userId: string, dto: CreateExperienceDto) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException();
    return this.prisma.experience.create({ data: { ...dto, studentId: student.id } });
  }

  async deleteExperience(userId: string, expId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException();
    const exp = await this.prisma.experience.findUnique({ where: { id: expId } });
    if (!exp || exp.studentId !== student.id) throw new ForbiddenException();
    await this.prisma.experience.delete({ where: { id: expId } });
    return { message: 'Experience deleted' };
  }

  async listStudents(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        skip,
        take: limit,
        where: { profileCompleted: true },
        include: { projects: { take: 3 } },
        orderBy: { profileScore: 'desc' },
      }),
      this.prisma.student.count({ where: { profileCompleted: true } }),
    ]);
    return { students, total, page, limit, pages: Math.ceil(total / limit) };
  }
}
