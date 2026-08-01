import {
  Controller, Get, Put, Post, Delete, Body, Param, UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { StudentsService } from './students.service';
import { UpdateStudentDto, CreateProjectDto, CreateExperienceDto, UpdateProjectDto } from './students.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all students (paginated)' })
  listStudents(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.studentsService.listStudents(+page, +limit);
  }

  @Get('me')
  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get my student profile' })
  getMyProfile(@CurrentUser() user: { userId: string }) {
    return this.studentsService.getProfile(user.userId);
  }

  @Put('me')
  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update my student profile' })
  updateProfile(@CurrentUser() user: { userId: string }, @Body() dto: UpdateStudentDto) {
    return this.studentsService.updateProfile(user.userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  getStudent(@Param('id') id: string) {
    return this.studentsService.getStudentById(id);
  }

  // Projects
  @Post('me/projects')
  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  createProject(@CurrentUser() user: { userId: string }, @Body() dto: CreateProjectDto) {
    return this.studentsService.createProject(user.userId, dto);
  }

  @Put('me/projects/:id')
  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  updateProject(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.studentsService.updateProject(user.userId, id, dto);
  }

  @Delete('me/projects/:id')
  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  deleteProject(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.studentsService.deleteProject(user.userId, id);
  }

  // Experience
  @Post('me/experience')
  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  createExperience(@CurrentUser() user: { userId: string }, @Body() dto: CreateExperienceDto) {
    return this.studentsService.createExperience(user.userId, dto);
  }

  @Delete('me/experience/:id')
  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  deleteExperience(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.studentsService.deleteExperience(user.userId, id);
  }
}
