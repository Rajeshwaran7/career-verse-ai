import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        role: dto.role,
      },
    });

    // Auto-create profile skeleton
    if (dto.role === Role.STUDENT) {
      await this.prisma.student.create({
        data: { userId: user.id, name: dto.name || dto.email.split('@')[0] },
      });
    } else if (dto.role === Role.STARTUP) {
      await this.prisma.company.create({
        data: { userId: user.id, name: dto.name || 'My Company' },
      });
    }

    return this.signToken(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    return this.signToken(user.id, user.email, user.role);
  }

  async googleLogin(googleUser: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl: string;
  }) {
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: googleUser.googleId }, { email: googleUser.email }] },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          googleId: googleUser.googleId,
          avatarUrl: googleUser.avatarUrl,
          isVerified: true,
          role: Role.STUDENT,
        },
      });
      await this.prisma.student.create({
        data: { userId: user.id, name: googleUser.name, avatarUrl: googleUser.avatarUrl },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.googleId, avatarUrl: googleUser.avatarUrl },
      });
    }

    return this.signToken(user.id, user.email, user.role);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, avatarUrl: true, isVerified: true },
    });
    if (!user) throw new UnauthorizedException();

    if (user.role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({ where: { userId } });
      return { ...user, profile: student };
    } else if (user.role === Role.STARTUP) {
      const company = await this.prisma.company.findUnique({ where: { userId } });
      return { ...user, profile: company };
    }
    return user;
  }

  private async signToken(userId: string, email: string, role: Role) {
    const payload = { sub: userId, email, role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN') || '7d',
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, avatarUrl: true },
    });

    let name: string | undefined;
    if (role === Role.STUDENT) {
      const s = await this.prisma.student.findUnique({ where: { userId } });
      name = s?.name;
    } else if (role === Role.STARTUP) {
      const c = await this.prisma.company.findUnique({ where: { userId } });
      name = c?.name;
    }

    return { accessToken, user: { ...user, name } };
  }
}
