import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { InternshipsService } from './internships.service';
import { CreateInternshipDto, UpdateInternshipDto } from './internships.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Internships')
@ApiBearerAuth()
@Controller('internships')
export class InternshipsController {
  constructor(private internshipsService: InternshipsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active internships' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.internshipsService.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get internship details' })
  findOne(@Param('id') id: string) {
    return this.internshipsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STARTUP)
  @ApiOperation({ summary: 'Create internship posting' })
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateInternshipDto) {
    return this.internshipsService.create(user.userId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STARTUP)
  @ApiOperation({ summary: 'Update internship posting' })
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateInternshipDto,
  ) {
    return this.internshipsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STARTUP)
  @ApiOperation({ summary: 'Delete internship posting' })
  delete(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.internshipsService.delete(user.userId, id);
  }

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Apply to internship' })
  apply(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body('coverLetter') coverLetter?: string,
  ) {
    return this.internshipsService.apply(user.userId, id, coverLetter);
  }

  @Get('my/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get my applications' })
  getMyApplications(@CurrentUser() user: { userId: string }) {
    return this.internshipsService.getMyApplications(user.userId);
  }

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STARTUP)
  @ApiOperation({ summary: 'Get applications for an internship' })
  getApplications(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.internshipsService.getApplicationsForInternship(user.userId, id);
  }
}
