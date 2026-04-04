// apps/api/src/organizations/organizations.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@crm/db';
import {
  ApiResponse,
  ApiResponseShape,
  CreateOrganizationDto,
} from '@crm/types';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(correlationId: string): Promise<ApiResponseShape<unknown>> {
    const orgs = await this.prisma.organization.findMany({
      include: {
        _count: { select: { users: true, customers: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = orgs.map((o) => ({
      id: o.id,
      name: o.name,
      createdAt: o.createdAt,
      memberCount: o._count.users,
      customerCount: o._count.customers,
    }));

    return ApiResponse.success(data, 'Organizations retrieved', 200, { correlationId });
  }

  async findOne(id: string, correlationId: string): Promise<ApiResponseShape<unknown>> {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, createdAt: true },
        },
        _count: { select: { customers: true } },
      },
    });

    if (!org) throw new NotFoundException('Organization not found');

    return ApiResponse.success(
      {
        id: org.id,
        name: org.name,
        createdAt: org.createdAt,
        users: org.users,
        customerCount: org._count.customers,
      },
      'Organization retrieved',
      200,
      { correlationId },
    );
  }

  async create(
    dto: CreateOrganizationDto,
    correlationId: string,
  ): Promise<ApiResponseShape<unknown>> {
    const org = await this.prisma.organization.create({ data: { name: dto.name } });
    return ApiResponse.created(org, 'Organization created');
  }
}
