// apps/api/src/customers/customers.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CustomersService } from './customers.service';
import { TenantGuard } from '../common/guards/tenant.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Roles, CurrentUser } from '../common/decorators';
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  AssignCustomerSchema,
  PaginationQuerySchema,
  CreateCustomerDto,
  UpdateCustomerDto,
  AssignCustomerDto,
  PaginationQuery,
  JwtPayload,
} from '@crm/types';
import { getRequestContext } from '../common/context/request-context';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create customer (auto-assigned to creator)' })
  create(
    @Body(new ZodValidationPipe(CreateCustomerSchema)) dto: CreateCustomerDto,
    @CurrentUser() caller: JwtPayload,
  ) {
    const { correlationId } = getRequestContext()!;
    return this.customersService.create(dto, caller, correlationId);
  }

  @Get()
  @ApiOperation({ summary: 'List customers with cursor pagination and search' })
  findAll(
    @Query(new ZodValidationPipe(PaginationQuerySchema)) query: PaginationQuery,
    @CurrentUser() caller: JwtPayload,
  ) {
    const { correlationId } = getRequestContext()!;
    return this.customersService.findAll(query, caller, correlationId);
  }

  @Get(':id')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get customer by id with notes' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() caller: JwtPayload,
  ) {
    const { correlationId } = getRequestContext()!;
    return this.customersService.findOne(id, caller, correlationId);
  }

  @Patch(':id')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Update customer' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateCustomerSchema)) dto: UpdateCustomerDto,
    @CurrentUser() caller: JwtPayload,
  ) {
    const { correlationId } = getRequestContext()!;
    return this.customersService.update(id, dto, caller, correlationId);
  }

  @Delete(':id')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(200)
  @ApiOperation({ summary: 'Soft delete customer (admin only)' })
  softDelete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() caller: JwtPayload,
  ) {
    const { correlationId } = getRequestContext()!;
    return this.customersService.softDelete(id, caller, correlationId);
  }

  @Post(':id/restore')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(200)
  @ApiOperation({ summary: 'Restore soft-deleted customer (admin only)' })
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() caller: JwtPayload,
  ) {
    const { correlationId } = getRequestContext()!;
    return this.customersService.restore(id, caller, correlationId);
  }

  @Post(':id/assign')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Assign customer to user — concurrency-safe (admin only)' })
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(AssignCustomerSchema)) dto: AssignCustomerDto,
    @CurrentUser() caller: JwtPayload,
  ) {
    const { correlationId } = getRequestContext()!;
    return this.customersService.assign(id, dto, caller, correlationId);
  }
}
