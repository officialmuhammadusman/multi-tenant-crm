// apps/api/src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import Redis from 'ioredis';
import { PrismaService } from '@crm/db';
import { LoginDto, JwtPayload, TokenResponse, ApiResponse, ApiResponseShape } from '@crm/types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async login(dto: LoginDto, correlationId: string): Promise<ApiResponseShape<TokenResponse>> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    // Same error for both wrong email and wrong password — prevents enumeration
    const invalidMsg = 'Invalid email or password';
    if (!user) throw new UnauthorizedException(invalidMsg);

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException(invalidMsg);

    const jti = uuidv4();
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role as JwtPayload['role'],
      isSuperAdmin: user.isSuperAdmin,
      organizationId: user.organizationId,
      jti,
    };

    const accessToken = this.jwtService.sign(payload);

    // Store refresh token
    const refreshToken = randomBytes(64).toString('hex');
    const expiresDays = this.config.get<number>('REFRESH_TOKEN_EXPIRES_DAYS', 7);
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    const tokenResponse: TokenResponse = {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as JwtPayload['role'],
        isSuperAdmin: user.isSuperAdmin,
        organizationId: user.organizationId,
        createdAt: user.createdAt,
      },
    };

    return ApiResponse.success(tokenResponse, 'Login successful', 200, { correlationId });
  }

  async loginAndGetRefreshToken(
    dto: LoginDto,
    correlationId: string,
  ): Promise<{ response: ApiResponseShape<TokenResponse>; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    const invalidMsg = 'Invalid email or password';
    if (!user) throw new UnauthorizedException(invalidMsg);

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException(invalidMsg);

    const jti = uuidv4();
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role as JwtPayload['role'],
      isSuperAdmin: user.isSuperAdmin,
      organizationId: user.organizationId,
      jti,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = randomBytes(64).toString('hex');
    const expiresDays = this.config.get<number>('REFRESH_TOKEN_EXPIRES_DAYS', 7);
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    const response = ApiResponse.success<TokenResponse>(
      {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as JwtPayload['role'],
          isSuperAdmin: user.isSuperAdmin,
          organizationId: user.organizationId,
          createdAt: user.createdAt,
        },
      },
      'Login successful',
      200,
      { correlationId },
    );

    return { response, refreshToken };
  }

  async refresh(
    refreshTokenValue: string,
    correlationId: string,
  ): Promise<{ response: ApiResponseShape<{ accessToken: string }>; newRefreshToken: string }> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshTokenValue },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Token reuse detection — revoke entire session
    if (stored.revoked) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId },
        data: { revoked: true },
      });
      throw new UnauthorizedException('Refresh token reuse detected. Please login again.');
    }

    // Rotate: revoke old token
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    // Issue new JWT
    const user = stored.user;
    const jti = uuidv4();
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role as JwtPayload['role'],
      isSuperAdmin: user.isSuperAdmin,
      organizationId: user.organizationId,
      jti,
    };

    const accessToken = this.jwtService.sign(payload);

    // Issue new refresh token
    const newRefreshToken = randomBytes(64).toString('hex');
    const expiresDays = this.config.get<number>('REFRESH_TOKEN_EXPIRES_DAYS', 7);
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: user.id, expiresAt },
    });

    return {
      response: ApiResponse.success({ accessToken }, 'Token refreshed', 200, { correlationId }),
      newRefreshToken,
    };
  }

  async logout(
    refreshTokenValue: string,
    accessToken: string,
    correlationId: string,
  ): Promise<ApiResponseShape<null>> {
    // Revoke refresh token
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshTokenValue },
      data: { revoked: true },
    });

    // Add access token to Redis blocklist until it expires
    try {
      const decoded = this.jwtService.decode<JwtPayload>(accessToken);
      if (decoded?.jti && decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await this.redis.setex(`blocklist:${decoded.jti}`, ttl, '1');
        }
      }
    } catch {
      this.logger.warn('Could not decode access token during logout');
    }

    return ApiResponse.success(null, 'Logged out successfully', 200, { correlationId });
  }
}

