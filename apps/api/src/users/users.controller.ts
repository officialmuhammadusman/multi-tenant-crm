// apps/api/src/users/users.controller.ts
import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Roles, CurrentUser } from '../common/decorators';
import { CreateUserSchema, CreateUserDto, JwtPayload } from '@crm/types';
import { getRequestContext } from '../common/context/request-context';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  getMe(@CurrentUser() user: JwtPayload) {
    const { correlationId } = getRequestContext()!;
    return this.usersService.findMe(user.sub, correlationId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users in organization' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('organizationId') orgIdParam?: string,
  ) {
    const { correlationId } = getRequestContext()!;
    // Super admin can query any org by passing organizationId param
    const orgId = user.isSuperAdmin && orgIdParam
      ? orgIdParam
      : (user.organizationId ?? '');
    return this.usersService.findAllInOrg(orgId, correlationId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  create(
    @Body(new ZodValidationPipe(CreateUserSchema)) dto: CreateUserDto,
    @CurrentUser() caller: JwtPayload,
  ) {
    const { correlationId } = getRequestContext()!;
    return this.usersService.create(dto, caller, correlationId);
  }
}
