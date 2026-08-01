import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

export interface SearchFilters {
  query?: string;
  skills?: string[];
  college?: string;
  location?: string;
  graduationYear?: number;
  remote?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async searchStudents(filters: SearchFilters) {
    const { page = 1, limit = 12 } = filters;
    const skip = (page - 1) * limit;

    // Parse query with AI if provided
    let aiFilters: { skills?: string[]; location?: string } = {};
    if (filters.query) {
      aiFilters = await this.aiService.semanticSearch(filters.query);
    }

    // Build Prisma where clause
    const where: any = { profileCompleted: true };

    const skillsToSearch = [
      ...(filters.skills || []),
      ...(aiFilters.skills || []),
    ].map((s) => s.toLowerCase());

    if (skillsToSearch.length > 0) {
      where.OR = [
        { programmingLangs: { hasSome: skillsToSearch } },
        { frameworks: { hasSome: skillsToSearch } },
        { databases: { hasSome: skillsToSearch } },
        { tools: { hasSome: skillsToSearch } },
        { cloudPlatforms: { hasSome: skillsToSearch } },
      ];
    }

    const locationSearch = filters.location || aiFilters.location;
    if (locationSearch) {
      where.location = { contains: locationSearch, mode: 'insensitive' };
    }

    if (filters.college) {
      where.college = { contains: filters.college, mode: 'insensitive' };
    }

    if (filters.graduationYear) {
      where.graduationYear = filters.graduationYear;
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        skip,
        take: limit,
        where,
        include: { projects: { take: 3 } },
        orderBy: [{ profileScore: 'desc' }, { aiPassportUpdatedAt: 'desc' }],
      }),
      this.prisma.student.count({ where }),
    ]);

    // AI ranking for query-based searches
    let rankedStudents = students;
    if (filters.query && students.length > 0) {
      try {
        const rankings = await this.aiService.generateSearchRanking(filters.query, students);
        const rankMap = new Map(rankings.map((r) => [r.studentId, r]));

        rankedStudents = students
          .map((s) => ({
            ...s,
            matchScore: rankMap.get(s.id)?.score || 50,
            matchReason: rankMap.get(s.id)?.reason || '',
          }))
          .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      } catch {
        rankedStudents = students.map((s) => ({ ...s, matchScore: 70, matchReason: '' }));
      }
    } else {
      rankedStudents = students.map((s) => ({
        ...s,
        matchScore: s.profileScore,
        matchReason: '',
      }));
    }

    return {
      students: rankedStudents,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      query: filters.query,
    };
  }

  async getRecommendedStudents(companyId: string, limit = 6) {
    // Get company's recent internship skills
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { internships: { take: 3, orderBy: { createdAt: 'desc' } } },
    });

    if (!company || company.internships.length === 0) {
      return this.prisma.student.findMany({
        where: { profileCompleted: true },
        take: limit,
        orderBy: { profileScore: 'desc' },
        include: { projects: { take: 2 } },
      });
    }

    const requiredSkills = company.internships.flatMap((i) => i.skillsRequired);
    const uniqueSkills = [...new Set(requiredSkills)].map((s) => s.toLowerCase());

    return this.prisma.student.findMany({
      where: {
        profileCompleted: true,
        OR: [
          { programmingLangs: { hasSome: uniqueSkills } },
          { frameworks: { hasSome: uniqueSkills } },
          { databases: { hasSome: uniqueSkills } },
        ],
      },
      take: limit,
      orderBy: { profileScore: 'desc' },
      include: { projects: { take: 2 } },
    });
  }
}
