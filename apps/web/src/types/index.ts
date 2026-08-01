export type Role = 'STUDENT' | 'STARTUP' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  name?: string;
  profile?: Student | Company;
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  cgpa?: number;
  githubUsername?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  programmingLangs: string[];
  frameworks: string[];
  databases: string[];
  cloudPlatforms: string[];
  tools: string[];
  githubData?: GitHubData;
  githubScore?: number;
  aiSummary?: string;
  aiSkillScores?: Record<string, number>;
  aiStrengths?: string[];
  aiImprovements?: string[];
  aiPassportUpdatedAt?: string;
  profileCompleted: boolean;
  profileScore: number;
  projects: Project[];
  experiences: Experience[];
  matchScore?: number;
  matchReason?: string;
}

export interface Project {
  id: string;
  studentId: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Experience {
  id: string;
  studentId: string;
  company: string;
  role: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  location?: string;
}

export interface Company {
  id: string;
  userId: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  description?: string;
  logoUrl?: string;
  location?: string;
  isVerified: boolean;
  internships?: Internship[];
}

export interface Internship {
  id: string;
  companyId: string;
  company?: Company;
  position: string;
  description: string;
  skillsRequired: string[];
  duration: string;
  stipend?: string;
  location?: string;
  workType: 'REMOTE' | 'HYBRID' | 'ONSITE';
  openings: number;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'EXPIRED';
  createdAt: string;
  _count?: { applications: number };
}

export interface Application {
  id: string;
  studentId: string;
  internshipId: string;
  internship?: Internship;
  status: 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
  coverLetter?: string;
  matchScore?: number;
  createdAt: string;
}

export interface GitHubData {
  login: string;
  name?: string;
  avatarUrl: string;
  bio?: string;
  followers: number;
  following: number;
  publicRepos: number;
  totalStars: number;
  totalForks: number;
  languages: Record<string, number>;
  topRepos: GitHubRepo[];
  fetchedAt: string;
}

export interface GitHubRepo {
  name: string;
  description?: string;
  stars: number;
  forks: number;
  language?: string;
  url: string;
  updatedAt: string;
}

export interface TalentPassport {
  summary: string;
  skillScores: Record<string, number>;
  strengths: string[];
  improvements: string[];
}

export interface SearchResult {
  students: Student[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  query?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
