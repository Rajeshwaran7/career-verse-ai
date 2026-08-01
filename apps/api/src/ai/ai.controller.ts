import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StudentsService } from '../students/students.service';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private aiService: AiService,
    private studentsService: StudentsService,
  ) {}

  @Post('passport/generate')
  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Generate AI Talent Passport for current student' })
  async generateMyPassport(@CurrentUser() user: { userId: string }) {
    const student = await this.studentsService.getProfile(user.userId);
    return this.aiService.generateTalentPassport(student.id);
  }

  @Get('passport/:studentId')
  @ApiOperation({ summary: 'Get AI Talent Passport for a student' })
  async getPassport(@Param('studentId') studentId: string) {
    return this.aiService.generateTalentPassport(studentId);
  }
}
