import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ClerkTokenGuard } from './guards/clerk-token.guard';
import { CurrentUser } from './decorators/current-user.decorator';

class SetRoleDto {
  @ApiProperty({ enum: Role }) @IsEnum(Role) role: Role;
  @ApiProperty() @IsString() @MinLength(2) name: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Called by frontend after every Clerk sign-in/sign-up.
   * Syncs the Clerk user to our DB and returns role + profile info.
   */
  @Post('sync')
  @UseGuards(ClerkTokenGuard)
  @ApiOperation({ summary: 'Sync Clerk user to our database' })
  sync(@Req() req: any) {
    return this.authService.syncUser(req.clerkId);
  }

  /**
   * Called during onboarding to assign a role (STUDENT/STARTUP).
   * Creates the student or company profile skeleton.
   */
  @Post('role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set user role during onboarding' })
  setRole(@CurrentUser() user: { userId: string }, @Body() dto: SetRoleDto) {
    return this.authService.setRole(user.userId, dto.role, dto.name);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  getMe(@CurrentUser() user: { userId: string }) {
    return this.authService.getMe(user.userId);
  }
}
