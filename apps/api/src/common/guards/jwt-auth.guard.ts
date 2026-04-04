// apps/api/src/common/guards/jwt-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import Redis from 'ioredis';
import { JwtPayloadSchema, JwtPayload } from '@crm/types';
import { IS_PUBLIC_KEY } from '../decorators';
import { requestContextStorage } from '../context/request-context';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Access token missing');
    }

    let payload: JwtPayload;
    try {
      const raw = this.jwtService.verify<JwtPayload>(token);
      payload = JwtPayloadSchema.parse(raw);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    // Check Redis blocklist for logged-out tokens
    const blocked = await this.redis.get(`blocklist:${payload.jti}`);
    if (blocked) {
      throw new UnauthorizedException('Token has been revoked');
    }

    request.user = payload;

    // Inject into AsyncLocalStorage so Prisma extension can read it
    const currentCtx = requestContextStorage.getStore();
    if (currentCtx) {
      currentCtx.userId = payload.sub;
      currentCtx.organizationId = payload.organizationId;
      currentCtx.role = payload.role;
      currentCtx.isSuperAdmin = payload.isSuperAdmin;
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = (request.headers.authorization ?? '').split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
