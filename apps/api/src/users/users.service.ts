// apps/api/src/users/users.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PrismaService } from '@crm/db';
import {
  ApiResponse,
  ApiResponseShape,
  CreateUserDto,
  JwtPayload,
} from '@crm/types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateUserDto,
    caller: JwtPayload,
    _correlationId: string,
  ): Promise<ApiResponseShape<unknown>> {
    // Admins can only create users in their own org
    const organizationId = caller.organizationId;
    if (!organizationId) throw new ForbiddenException('Cannot create users without an organization');

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role as 'ADMIN' | 'MEMBER',
        isSuperAdmin: false,
        organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isSuperAdmin: true,
        organizationId: true,
        createdAt: true,
      },
    });

    return ApiResponse.created(user, 'User created successfully');
  }

  async findAllInOrg(
    organizationId: string,
    _correlationId: string,
  ): Promise<ApiResponseShape<unknown>> {
    const users = await this.prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return ApiResponse.success(users, 'Users retrieved', 200, { correlationId: _correlationId });
  }

  async findMe(userId: string, correlationId: string): Promise<ApiResponseShape<unknown>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isSuperAdmin: true,
        organizationId: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return ApiResponse.success(user, 'Profile retrieved', 200, { correlationId: correlationId });
  }
}
