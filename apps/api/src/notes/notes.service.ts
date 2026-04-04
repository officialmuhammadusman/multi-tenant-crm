// apps/api/src/notes/notes.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@crm/db';
import { ApiResponse, ApiResponseShape, CreateNoteDto, JwtPayload } from '@crm/types';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateNoteDto,
    caller: JwtPayload,
    correlationId: string,
  ): Promise<ApiResponseShape<unknown>> {
    const orgId = caller.organizationId;

    // Verify customer exists and belongs to caller's org (unless super admin)
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: dto.customerId,
        deletedAt: null,
        ...(!caller.isSuperAdmin ? { organizationId: orgId! } : {}),
      },
    });

    if (!customer) throw new NotFoundException('Customer not found');

    const note = await this.prisma.$transaction(async (tx) => {
      const created = await tx.note.create({
        data: {
          content: dto.content,
          customerId: dto.customerId,
          organizationId: customer.organizationId,
          createdBy: caller.sub,
        },
        select: {
          id: true,
          content: true,
          customerId: true,
          organizationId: true,
          createdBy: true,
          createdAt: true,
          creator: { select: { id: true, name: true, email: true } },
        },
      });

      await tx.activityLog.create({
        data: {
          entityType: 'Note',
          entityId: created.id,
          action: 'NOTE_ADDED',
          performedBy: caller.sub,
          organizationId: customer.organizationId,
        },
      });

      return created;
    });

    return ApiResponse.created(note, 'Note added');
  }

  async findByCustomer(
    customerId: string,
    caller: JwtPayload,
    correlationId: string,
  ): Promise<ApiResponseShape<unknown>> {
    // Verify customer exists; if soft-deleted, return empty array
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        ...(!caller.isSuperAdmin ? { organizationId: caller.organizationId! } : {}),
      },
    });

    if (!customer) throw new NotFoundException('Customer not found');

    // If customer is soft-deleted, notes are hidden
    if (customer.deletedAt !== null) {
      return ApiResponse.success([], 'Notes retrieved', 200, { correlationId });
    }

    const notes = await this.prisma.note.findMany({
      where: {
        customerId,
        ...(!caller.isSuperAdmin ? { organizationId: caller.organizationId! } : {}),
      },
      select: {
        id: true,
        content: true,
        customerId: true,
        organizationId: true,
        createdBy: true,
        createdAt: true,
        creator: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponse.success(notes, 'Notes retrieved', 200, { correlationId });
  }
}
