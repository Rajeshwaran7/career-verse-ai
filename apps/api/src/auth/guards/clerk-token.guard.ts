import {
  Injectable, CanActivate, ExecutionContext, UnauthorizedException,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

/**
 * Verifies the Clerk JWT but does NOT require the user to exist in our DB.
 * Used for the /auth/sync endpoint where we're creating the user for the first time.
 */
@Injectable()
export class ClerkTokenGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers?.authorization as string | undefined;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization token');
    }

    const token = authHeader.substring(7);

    try {
      const payload = await verifyToken(token, {
        secretKey: this.config.get<string>('CLERK_SECRET_KEY'),
      });
      req.clerkPayload = payload;
      req.clerkId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid Clerk token');
    }
  }
}
