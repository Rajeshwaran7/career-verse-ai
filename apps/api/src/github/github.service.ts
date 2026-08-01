import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  html_url: string;
  updated_at: string;
}

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);
  private readonly baseUrl = 'https://api.github.com';

  constructor(private prisma: PrismaService) {}

  async fetchAndUpdateGitHubData(userId: string, username: string) {
    try {
      const [userResponse, reposResponse] = await Promise.all([
        fetch(`${this.baseUrl}/users/${username}`, {
          headers: { Authorization: `token ${process.env.GITHUB_TOKEN || ''}` },
        }),
        fetch(`${this.baseUrl}/users/${username}/repos?sort=updated&per_page=30`, {
          headers: { Authorization: `token ${process.env.GITHUB_TOKEN || ''}` },
        }),
      ]);

      if (!userResponse.ok) throw new Error(`GitHub user not found: ${username}`);

      const githubUser = (await userResponse.json()) as any;
      const repos: GitHubRepo[] = reposResponse.ok ? ((await reposResponse.json()) as GitHubRepo[]) : [];

      // Calculate language distribution
      const languages: Record<string, number> = {};
      repos.forEach((repo) => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      });

      // Calculate GitHub score
      const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
      const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);
      const repoCount = repos.length;
      const githubScore = Math.min(
        Math.floor((totalStars * 2 + totalForks * 1.5 + repoCount * 3 + (githubUser.followers || 0)) / 2),
        100,
      );

      const githubData = {
        login: githubUser.login,
        name: githubUser.name,
        avatarUrl: githubUser.avatar_url,
        bio: githubUser.bio,
        followers: githubUser.followers,
        following: githubUser.following,
        publicRepos: githubUser.public_repos,
        totalStars,
        totalForks,
        languages,
        topRepos: repos.slice(0, 6).map((r) => ({
          name: r.name,
          description: r.description,
          stars: r.stargazers_count,
          forks: r.forks_count,
          language: r.language,
          url: r.html_url,
          updatedAt: r.updated_at,
        })),
        fetchedAt: new Date().toISOString(),
      };

      await this.prisma.student.update({
        where: { userId },
        data: { githubData, githubScore, githubUsername: username },
      });

      return githubData;
    } catch (error) {
      this.logger.error(`Failed to fetch GitHub data for ${username}`, error);
      throw error;
    }
  }

  async getGitHubData(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: { githubData: true, githubScore: true, githubUsername: true },
    });
    return student;
  }
}
