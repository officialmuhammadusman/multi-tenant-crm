// apps/api/src/organizations/organizations.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateOrganizationSchema, CreateOrganizationDto } from '@crm/types';
import { getRequestContext } from '../common/context/request-context';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all organizations (super admin only)' })
  findAll() {
    const { correlationId } = getRequestContext()!;
    return this.organizationsService.findAll(correlationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by id (super admin only)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    const { correlationId } = getRequestContext()!;
    return this.organizationsService.findOne(id, correlationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create organization (super admin only)' })
  create(
    @Body(new ZodValidationPipe(CreateOrganizationSchema)) dto: CreateOrganizationDto,
  ) {
    const { correlationId } = getRequestContext()!;
    return this.organizationsService.create(dto, correlationId);
  }
}
