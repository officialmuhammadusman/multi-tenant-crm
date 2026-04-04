// apps/api/src/customers/customers.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@crm/db';
import {
  ApiResponse,
  ApiResponseShape,
  CreateCustomerDto,
  UpdateCustomerDto,
  AssignCustomerDto,
  JwtPayload,
  PaginationQuery,
  getActivityLabel,
} from '@crm/types';

const CUSTOMER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  organizationId: true,
  assignedTo: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  assignedUser: {
    select: { id: true, name: true, email: true, role: true },
  },
  organization: {
    select: { id: true, name: true },
  },
};

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Create ────────────────────────────────────────────────────────────────

  async create(
    dto: CreateCustomerDto,
    caller: JwtPayload,
    correlationId: string,
  ): Promise<ApiResponseShape<unknown>> {
    const organizationId = caller.organizationId;
    if (!organizationId) throw new ForbiddenException('No organization context');

    const customer = await this.prisma.$transaction(async (tx) => {
      const created = await tx.customer.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone ?? null,
          organizationId,
          assignedTo: caller.sub, // auto-assign to creator
        },
        select: CUSTOMER_SELECT,
      });

      await tx.activityLog.create({
        data: {
          entityType: 'Customer',
          entityId: created.id,
          action: 'CUSTOMER_CREATED',
          performedBy: caller.sub,
          organizationId,
        },
      });

      return created;
    });

    return ApiResponse.created(customer, 'Customer created');
  }

  // ── List ──────────────────────────────────────────────────────────────────

  async findAll(
    query: PaginationQuery,
    caller: JwtPayload,
    correlationId: string,
  ): Promise<ApiResponseShape<unknown>> {
    const limit = query.limit ?? 20;
    const orgId = caller.isSuperAdmin
      ? (query.organizationId ?? undefined)
      : (caller.organizationId ?? undefined);

    // Build where clause
    const where: Record<string, unknown> = {
      deletedAt: null,
      ...(orgId ? { organizationId: orgId } : {}),
    };

    // Full-text search via raw SQL if search param provided
    if (query.search && query.search.trim()) {
      const results = await this.prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM customers
        WHERE deleted_at IS NULL
        ${orgId ? this.prisma.$queryRaw`AND organization_id = ${orgId}::uuid` : this.prisma.$queryRaw``}
        AND search_vector @@ plainto_tsquery('english', ${query.search})
        ORDER BY created_at DESC, id DESC
        LIMIT ${limit + 1}
      `;
      const ids = results.map((r) => r.id);
      const hasMore = ids.length > limit;
      const pageIds = ids.slice(0, limit);

      const customers = await this.prisma.customer.findMany({
        where: { id: { in: pageIds }, deletedAt: null },
        select: CUSTOMER_SELECT,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });

      return ApiResponse.paginated(customers, null, hasMore, limit, 'Customers retrieved', correlationId);
    }

    // Cursor-based pagination
    if (query.cursor) {
      const [cursorCreatedAt, cursorId] = query.cursor.split('_');
      where['OR'] = [
        { createdAt: { lt: new Date(cursorCreatedAt!) } },
        { createdAt: new Date(cursorCreatedAt!), id: { lt: cursorId } },
      ];
    }

    const customers = await this.prisma.customer.findMany({
      where,
      select: CUSTOMER_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    });

    const hasMore = customers.length > limit;
    const page = customers.slice(0, limit);
    const last = page[page.length - 1];
    const nextCursor = hasMore && last
      ? `${last.createdAt.toISOString()}_${last.id}`
      : null;

    return ApiResponse.paginated(page, nextCursor, hasMore, limit, 'Customers retrieved', correlationId);
  }

  // ── FindOne ───────────────────────────────────────────────────────────────

  async findOne(id: string, caller: JwtPayload, correlationId: string): Promise<ApiResponseShape<unknown>> {
    const where: Record<string, unknown> = { id, deletedAt: null };
    if (!caller.isSuperAdmin) where['organizationId'] = caller.organizationId;

    const customer = await this.prisma.customer.findFirst({
      where,
      select: {
        ...CUSTOMER_SELECT,
        notes: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            createdBy: true,
            creator: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) throw new NotFoundException('Customer not found');
    return ApiResponse.success(customer, 'Customer retrieved', 200, { correlationId });
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(
    id: string,
    dto: UpdateCustomerDto,
    caller: JwtPayload,
    correlationId: string,
  ): Promise<ApiResponseShape<unknown>> {
    const existing = await this.prisma.customer.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(!caller.isSuperAdmin ? { organizationId: caller.organizationId! } : {}),
      },
    });

    if (!existing) throw new NotFoundException('Customer not found');

    // Members can only edit customers assigned to them
    if (caller.role === 'MEMBER' && existing.assignedTo !== caller.sub) {
      throw new ForbiddenException('You can only edit customers assigned to you');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.customer.update({
        where: { id },
        data: { ...dto },
        select: CUSTOMER_SELECT,
      });

      await tx.activityLog.create({
        data: {
          entityType: 'Customer',
          entityId: id,
          action: 'CUSTOMER_UPDATED',
          performedBy: caller.sub,
          organizationId: existing.organizationId,
        },
      });

      return result;
    });

    return ApiResponse.success(updated, 'Customer updated', 200, { correlationId });
  }

  // ── Soft Delete ───────────────────────────────────────────────────────────

  async softDelete(id: string, caller: JwtPayload, correlationId: string): Promise<ApiResponseShape<unknown>> {
    const existing = await this.prisma.customer.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(!caller.isSuperAdmin ? { organizationId: caller.organizationId! } : {}),
      },
    });

    if (!existing) throw new NotFoundException('Customer not found');

    await this.prisma.$transaction(async (tx) => {
      await tx.customer.update({ where: { id }, data: { deletedAt: new Date() } });
      await tx.activityLog.create({
        data: {
          entityType: 'Customer',
          entityId: id,
          action: 'CUSTOMER_DELETED',
          performedBy: caller.sub,
          organizationId: existing.organizationId,
        },
      });
    });

    return ApiResponse.success(null, 'Customer deleted', 200, { correlationId });
  }

  // ── Restore ───────────────────────────────────────────────────────────────

  async restore(id: string, caller: JwtPayload, correlationId: string): Promise<ApiResponseShape<unknown>> {
    const existing = await this.prisma.customer.findFirst({
      where: {
        id,
        deletedAt: { not: null },
        ...(!caller.isSuperAdmin ? { organizationId: caller.organizationId! } : {}),
      },
    });

    if (!existing) throw new NotFoundException('Deleted customer not found');

    const restored = await this.prisma.$transaction(async (tx) => {
      const result = await tx.customer.update({
        where: { id },
        data: { deletedAt: null },
        select: CUSTOMER_SELECT,
      });
      await tx.activityLog.create({
        data: {
          entityType: 'Customer',
          entityId: id,
          action: 'CUSTOMER_RESTORED',
          performedBy: caller.sub,
          organizationId: existing.organizationId,
        },
      });
      return result;
    });

    return ApiResponse.success(restored, 'Customer restored', 200, { correlationId });
  }

  // ── Assign (concurrency-safe) ─────────────────────────────────────────────

  async assign(
    customerId: string,
    dto: AssignCustomerDto,
    caller: JwtPayload,
    correlationId: string,
  ): Promise<ApiResponseShape<unknown>> {
    const orgId = caller.isSuperAdmin
      ? (await this.prisma.customer.findUnique({ where: { id: customerId }, select: { organizationId: true } }))?.organizationId
      : caller.organizationId;

    if (!orgId) throw new NotFoundException('Customer not found');

    const result = await this.prisma.$transaction(async (tx) => {
      // Lock user row first (always user before customer — deadlock prevention)
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${dto.userId}::uuid FOR UPDATE`;

      // Lock customer row second
      const [customerRow] = await tx.$queryRaw<{ id: string; assigned_to: string | null }[]>`
        SELECT id, assigned_to FROM customers WHERE id = ${customerId}::uuid AND deleted_at IS NULL FOR UPDATE
      `;

      if (!customerRow) throw new NotFoundException('Customer not found or deleted');
      if (customerRow.assigned_to) throw new ConflictException('Customer is already assigned');

      // 5-customer limit — skip for super admin
      if (!caller.isSuperAdmin) {
        const [countRow] = await tx.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count FROM customers
          WHERE assigned_to = ${dto.userId}::uuid AND deleted_at IS NULL
        `;
        if (Number(countRow?.count ?? 0) >= 5) {
          throw new ConflictException('User has reached the maximum of 5 active customers');
        }
      }

      // Perform assignment
      const updated = await tx.customer.update({
        where: { id: customerId },
        data: { assignedTo: dto.userId },
        select: CUSTOMER_SELECT,
      });

      await tx.activityLog.create({
        data: {
          entityType: 'Customer',
          entityId: customerId,
          action: 'CUSTOMER_ASSIGNED',
          performedBy: caller.sub,
          organizationId: orgId,
        },
      });

      return updated;
    }, { isolationLevel: 'Serializable' });

    return ApiResponse.success(result, 'Customer assigned', 200, { correlationId });
  }
}
