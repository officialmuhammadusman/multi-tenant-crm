// apps/api/src/common/guards/tenant.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '@crm/types';
import { PrismaService } from '@crm/db';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    const user = request.user;

    // Super admins bypass tenant isolation entirely
    if (user.isSuperAdmin) return true;

    const customerId = Array.isArray(request.params['id']) ? request.params['id'][0] : (request.params['id'] ?? (Array.isArray(request.params['customerId']) ? request.params['customerId'][0] : request.params['customerId']));
    if (!customerId) return true;

    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { organizationId: true },
    });

    if (!customer) throw new NotFoundException('Customer not found');

    if (customer.organizationId !== user.organizationId) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    return true;
  }
}
