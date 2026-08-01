import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './companies.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get('me')
  @Roles(Role.STARTUP)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get my company profile' })
  getMyProfile(@CurrentUser() user: { userId: string }) {
    return this.companiesService.getProfile(user.userId);
  }

  @Put('me')
  @Roles(Role.STARTUP)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update company profile' })
  updateProfile(@CurrentUser() user: { userId: string }, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.updateProfile(user.userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  getCompany(@Param('id') id: string) {
    return this.companiesService.getById(id);
  }

  @Get('me/saved-candidates')
  @Roles(Role.STARTUP)
  @UseGuards(RolesGuard)
  getSavedCandidates(@CurrentUser() user: { userId: string }) {
    return this.companiesService.getSavedCandidates(user.userId);
  }

  @Post('me/saved-candidates/:studentId')
  @Roles(Role.STARTUP)
  @UseGuards(RolesGuard)
  saveCandidate(
    @CurrentUser() user: { userId: string },
    @Param('studentId') studentId: string,
    @Body('notes') notes?: string,
  ) {
    return this.companiesService.saveCandidate(user.userId, studentId, notes);
  }

  @Delete('me/saved-candidates/:studentId')
  @Roles(Role.STARTUP)
  @UseGuards(RolesGuard)
  removeSavedCandidate(
    @CurrentUser() user: { userId: string },
    @Param('studentId') studentId: string,
  ) {
    return this.companiesService.removeSavedCandidate(user.userId, studentId);
  }
}
