import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GithubService } from './github.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

class ConnectGitHubDto {
  @ApiProperty() @IsString() username: string;
}

@ApiTags('GitHub')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
@Controller('github')
export class GithubController {
  constructor(private githubService: GithubService) {}

  @Post('connect')
  @ApiOperation({ summary: 'Connect and fetch GitHub data' })
  connect(@CurrentUser() user: { userId: string }, @Body() dto: ConnectGitHubDto) {
    return this.githubService.fetchAndUpdateGitHubData(user.userId, dto.username);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh GitHub data' })
  async refresh(@CurrentUser() user: { userId: string }) {
    const data = await this.githubService.getGitHubData(user.userId);
    if (!data?.githubUsername) return { message: 'No GitHub account connected' };
    return this.githubService.fetchAndUpdateGitHubData(user.userId, data.githubUsername);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my GitHub data' })
  getMyData(@CurrentUser() user: { userId: string }) {
    return this.githubService.getGitHubData(user.userId);
  }
}
