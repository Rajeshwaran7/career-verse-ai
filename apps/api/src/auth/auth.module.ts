import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ClerkTokenGuard } from './guards/clerk-token.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, ClerkTokenGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, ClerkTokenGuard, RolesGuard],
})
export class AuthModule {}
