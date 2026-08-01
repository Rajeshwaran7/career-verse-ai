import { Controller, Post, Get, Body, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth' })
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req: any, @Res() res: any) {
    const result = await this.authService.googleLogin(req.user);
    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/callback?token=${result.accessToken}&role=${result.user.role}`,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@CurrentUser() user: { userId: string }) {
    return this.authService.getProfile(user.userId);
  }
}
