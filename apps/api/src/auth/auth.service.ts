import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/backend';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  private clerk: ReturnType<typeof createClerkClient>;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.clerk = createClerkClient({
      secretKey: this.config.get<string>('CLERK_SECRET_KEY'),
    });
  }

  /**
   * Called after every Clerk sign-in/sign-up.
   * Creates the user in our DB if they don't exist, or returns existing user.
   * Returns isNew=true if the user hasn't completed onboarding (no role set).
   */
  async syncUser(clerkId: string) {
    // Fetch user details from Clerk
    const clerkUser = await this.clerk.users.getUser(clerkId);
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    const firstName = clerkUser.firstName || '';
    const lastName = clerkUser.lastName || '';
    const name = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];
    const avatarUrl = clerkUser.imageUrl || null;

    // Check if user already exists by clerkId
    let user = await this.prisma.user.findUnique({ where: { clerkId } });

    if (user) {
      // Update avatar/email in case it changed in Clerk
      user = await this.prisma.user.update({
        where: { clerkId },
        data: { avatarUrl, email, isVerified: true },
      });
    } else {
      // Check by email (migrating existing user)
      const existingByEmail = await this.prisma.user.findUnique({ where: { email } });
      if (existingByEmail) {
        user = await this.prisma.user.update({
          where: { email },
          data: { clerkId, avatarUrl, isVerified: true },
        });
        // Update student/company name if profile exists
        await this.updateProfileName(user, name, avatarUrl);
      } else {
        // Brand new user — no role assigned yet
        user = await this.prisma.user.create({
          data: { email, clerkId, avatarUrl, isVerified: true, role: Role.STUDENT },
        });
        return { ...user, name, isNew: true };
      }
    }

    // Get name from student/company profile
    const profile = await this.getProfile(user.id, user.role);
    return { ...user, name: (profile as any)?.name || name, isNew: false };
  }

  /**
   * Called on the onboarding page to set the user's role (STUDENT or STARTUP).
   */
  async setRole(userId: string, role: Role, name: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({ where: { id: userId }, data: { role } });

    // Create profile skeleton
    if (role === Role.STUDENT) {
      await this.prisma.student.upsert({
        where: { userId },
        update: {},
        create: { userId, name },
      });
    } else if (role === Role.STARTUP) {
      await this.prisma.company.upsert({
        where: { userId },
        update: {},
        create: { userId, name },
      });
    }

    const updated = await this.prisma.user.findUnique({ where: { id: userId } });
    return { ...updated, name };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, avatarUrl: true, isVerified: true, clerkId: true },
    });
    if (!user) throw new NotFoundException();

    const profile = await this.getProfile(userId, user.role);
    return { ...user, name: (profile as any)?.name, profile };
  }

  private async getProfile(userId: string, role: Role) {
    if (role === Role.STUDENT) {
      return this.prisma.student.findUnique({ where: { userId } });
    } else if (role === Role.STARTUP) {
      return this.prisma.company.findUnique({ where: { userId } });
    }
    return null;
  }

  private async updateProfileName(user: any, name: string, avatarUrl: string | null) {
    if (user.role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({ where: { userId: user.id } });
      if (student && !student.name) {
        await this.prisma.student.update({ where: { userId: user.id }, data: { name, avatarUrl } });
      }
    } else if (user.role === Role.STARTUP) {
      const company = await this.prisma.company.findUnique({ where: { userId: user.id } });
      if (company && company.name === 'My Company') {
        await this.prisma.company.update({ where: { userId: user.id }, data: { name } });
      }
    }
  }
}
