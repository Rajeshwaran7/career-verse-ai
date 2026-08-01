import { Controller, Get, Put, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics' })
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  listUsers(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.listUsers(+page, +limit);
  }

  @Get('students')
  @ApiOperation({ summary: 'List all students' })
  listStudents(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.listStudents(+page, +limit);
  }

  @Get('companies')
  @ApiOperation({ summary: 'List all companies' })
  listCompanies(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.listCompanies(+page, +limit);
  }

  @Put('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  deactivate(@Param('id') id: string) {
    return this.adminService.deactivateUser(id);
  }

  @Put('users/:id/activate')
  @ApiOperation({ summary: 'Activate user' })
  activate(@Param('id') id: string) {
    return this.adminService.activateUser(id);
  }
}
