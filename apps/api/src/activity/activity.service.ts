// apps/api/src/activity/activity.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@crm/db';
import {
  ApiResponse,
  ApiResponseShape,
  ActivityQuery,
  JwtPayload,
  getActivityLabel,
} from '@crm/types';

const LOG_SELECT = {
  id: true,
  entityType: true,
  entityId: true,
  action: true,
  performedBy: true,
  organizationId: true,
  timestamp: true,
  performer: { select: { id: true, name: true, email: true } },
  organization: { select: { id: true, name: true } },
};

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: ActivityQuery,
    caller: JwtPayload,
    correlationId: string,
  ): Promise<ApiResponseShape<unknown>> {
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = {};

    // Org scoping — super admin sees everything unless filtered
    if (!caller.isSuperAdmin) {
      where['organizationId'] = caller.organizationId;
    } else if (query.organizationId) {
      where['organizationId'] = query.organizationId;
    }

    if (query.action) where['action'] = query.action;
    if (query.entityType) where['entityType'] = query.entityType;
    if (query.performedBy) where['performedBy'] = query.performedBy;

    // Cursor
    if (query.cursor) {
      where['timestamp'] = { lt: new Date(query.cursor) };
    }

    const logs = await this.prisma.activityLog.findMany({
      where,
      select: LOG_SELECT,
      orderBy: { timestamp: 'desc' },
      take: limit + 1,
    });

    const hasMore = logs.length > limit;
    const page = logs.slice(0, limit);
    const last = page[page.length - 1];
    const nextCursor = hasMore && last ? last.timestamp.toISOString() : null;

    // Attach computed label to every log
    const withLabels = page.map((log) => ({
      ...log,
      label: getActivityLabel(log.action),
    }));

    return ApiResponse.paginated(withLabels, nextCursor, hasMore, limit, 'Activity logs retrieved', correlationId);
  }

  async findByCustomer(
    customerId: string,
    query: ActivityQuery,
    caller: JwtPayload,
    correlationId: string,
  ): Promise<ApiResponseShape<unknown>> {
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = {
      entityId: customerId,
      entityType: 'Customer',
    };

    if (!caller.isSuperAdmin) {
      where['organizationId'] = caller.organizationId;
    }

    if (query.cursor) {
      where['timestamp'] = { lt: new Date(query.cursor) };
    }

    const logs = await this.prisma.activityLog.findMany({
      where,
      select: LOG_SELECT,
      orderBy: { timestamp: 'desc' },
      take: limit + 1,
    });

    const hasMore = logs.length > limit;
    const page = logs.slice(0, limit);
    const last = page[page.length - 1];
    const nextCursor = hasMore && last ? last.timestamp.toISOString() : null;

    const withLabels = page.map((log) => ({
      ...log,
      label: getActivityLabel(log.action),
    }));

    return ApiResponse.paginated(withLabels, nextCursor, hasMore, limit, 'Activity logs retrieved', correlationId);
  }
}
