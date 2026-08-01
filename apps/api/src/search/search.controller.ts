import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CompaniesService } from '../companies/companies.service';
import { Role } from '@prisma/client';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(
    private searchService: SearchService,
    private companiesService: CompaniesService,
  ) {}

  @Get('students')
  @ApiOperation({ summary: 'Search students (AI-powered)' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'skills', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'college', required: false })
  @ApiQuery({ name: 'graduationYear', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  searchStudents(
    @Query('query') query?: string,
    @Query('skills') skills?: string,
    @Query('location') location?: string,
    @Query('college') college?: string,
    @Query('graduationYear') graduationYear?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 12,
  ) {
    return this.searchService.searchStudents({
      query,
      skills: skills ? skills.split(',') : undefined,
      location,
      college,
      graduationYear: graduationYear ? +graduationYear : undefined,
      page: +page,
      limit: +limit,
    });
  }

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recommended students for a company' })
  async getRecommendations(@CurrentUser() user: { userId: string; role: Role }) {
    if (user.role !== Role.STARTUP) return [];
    const company = await this.companiesService.getProfile(user.userId);
    return this.searchService.getRecommendedStudents(company.id);
  }
}
