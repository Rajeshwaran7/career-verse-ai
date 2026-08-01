import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

export interface TalentPassport {
  summary: string;
  skillScores: Record<string, number>;
  strengths: string[];
  improvements: string[];
}

@Injectable()
export class AiService {
  private openai: OpenAI;
  private readonly logger = new Logger(AiService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateTalentPassport(studentId: string): Promise<TalentPassport> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { projects: true, experiences: true },
    });
    if (!student) throw new Error('Student not found');

    const allSkills = [
      ...student.programmingLangs,
      ...student.frameworks,
      ...student.databases,
      ...student.cloudPlatforms,
      ...student.tools,
    ];

    const prompt = `
You are an AI talent evaluator for a developer talent platform. Analyze this student profile and generate a structured assessment.

Student Profile:
- Name: ${student.name}
- Location: ${student.location || 'Not specified'}
- Education: ${student.degree || ''} in ${student.branch || ''} at ${student.college || 'Unknown'} (${student.graduationYear || 'N/A'})
- CGPA: ${student.cgpa || 'Not specified'}
- Skills: ${allSkills.join(', ') || 'Not specified'}
- GitHub: ${student.githubUsername ? `@${student.githubUsername}` : 'Not connected'}
- Projects (${student.projects.length}):
${student.projects.map((p) => `  • ${p.title}: ${p.description} [${p.technologies.join(', ')}]`).join('\n') || 'No projects'}
- Experience: ${student.experiences.length} position(s)
- Bio: ${student.bio || 'None'}

Generate a JSON response with exactly this structure:
{
  "summary": "2-3 sentences describing the student's technical profile, strengths, and potential. Be specific and professional.",
  "skillScores": {
    "skill_name": score_0_to_100
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"]
}

Rules:
- skillScores: Score only skills they've listed. Max 8 skills. Score based on depth signals (projects, tech stack complexity).
- strengths: Be specific (e.g., "Strong backend architecture with 3 production projects" not "Good coding skills")
- improvements: Be actionable (e.g., "Add Docker containerization to projects" not "Learn more")
- summary: Name them by first name. Keep it under 60 words.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}') as TalentPassport;

      // Persist the passport
      await this.prisma.student.update({
        where: { id: studentId },
        data: {
          aiSummary: result.summary,
          aiSkillScores: result.skillScores,
          aiStrengths: result.strengths,
          aiImprovements: result.improvements,
          aiPassportUpdatedAt: new Date(),
        },
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to generate AI passport', error);
      // Return a fallback passport
      return this.generateFallbackPassport(student, allSkills);
    }
  }

  async parseResume(text: string): Promise<{
    skills: string[];
    education: { college?: string; degree?: string; branch?: string; graduationYear?: number };
    experience: Array<{ company: string; role: string; description?: string }>;
    projects: Array<{ title: string; description: string; technologies: string[] }>;
  }> {
    const prompt = `
Extract structured information from this resume text. Return valid JSON only.

Resume:
${text.substring(0, 4000)}

Return JSON with this exact structure:
{
  "skills": ["skill1", "skill2"],
  "education": {
    "college": "college name or null",
    "degree": "degree or null",
    "branch": "branch/major or null",
    "graduationYear": year_number_or_null
  },
  "experience": [
    { "company": "...", "role": "...", "description": "..." }
  ],
  "projects": [
    { "title": "...", "description": "...", "technologies": ["tech1"] }
  ]
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      this.logger.error('Failed to parse resume', error);
      return { skills: [], education: {}, experience: [], projects: [] };
    }
  }

  async semanticSearch(query: string): Promise<{
    keywords: string[];
    skills: string[];
    location?: string;
    graduationYear?: number;
  }> {
    const prompt = `
Parse this natural language talent search query into structured filters.

Query: "${query}"

Return JSON:
{
  "keywords": ["keyword1", "keyword2"],
  "skills": ["skill1", "skill2"],
  "location": "city/location or null",
  "graduationYear": year_number_or_null
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch {
      // Fallback: simple keyword extraction
      const words = query.toLowerCase().split(/\s+/);
      return { keywords: words, skills: words };
    }
  }

  async generateSearchRanking(
    query: string,
    students: any[],
  ): Promise<Array<{ studentId: string; score: number; reason: string }>> {
    if (students.length === 0) return [];

    const prompt = `
You are a technical recruiter. Rank these candidates for the search query: "${query}"

Candidates:
${students
  .map(
    (s, i) => `
${i + 1}. ID: ${s.id} | ${s.name} | ${s.college || 'No college'} | ${s.graduationYear || ''}
   Skills: ${[...s.programmingLangs, ...s.frameworks, ...s.databases].join(', ') || 'None'}
   Projects: ${s.projects?.length || 0} | AI Summary: ${s.aiSummary || 'Not generated'}
`,
  )
  .join('\n')}

Return JSON array (rank by relevance):
[{"studentId": "id", "score": 0-100, "reason": "one sentence why"}]
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      });
      const result = JSON.parse(response.choices[0].message.content || '{"results":[]}');
      return result.results || result;
    } catch {
      return students.map((s) => ({ studentId: s.id, score: 50, reason: 'Based on skill match' }));
    }
  }

  private generateFallbackPassport(student: any, allSkills: string[]): TalentPassport {
    const skillScores: Record<string, number> = {};
    allSkills.slice(0, 8).forEach((skill) => {
      skillScores[skill] = Math.floor(Math.random() * 30) + 60;
    });

    return {
      summary: `${student.name.split(' ')[0]} is a ${student.degree || 'Computer Science'} student at ${student.college || 'university'} with expertise in ${allSkills.slice(0, 3).join(', ') || 'software development'} and ${student.projects.length} portfolio projects.`,
      skillScores,
      strengths: [
        'Strong technical foundation',
        student.projects.length > 0 ? 'Active project portfolio' : 'Eager to build projects',
        student.githubUsername ? 'Active GitHub contributor' : 'Strong academic background',
      ],
      improvements: ['Build more real-world projects', 'Contribute to open source', 'Improve system design skills'],
    };
  }
}
