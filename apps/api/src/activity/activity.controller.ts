// apps/api/src/activity/activity.controller.ts
import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../common/decorators';
import { ActivityQuerySchema, ActivityQuery, JwtPayload } from '@crm/types';
import { getRequestContext } from '../common/context/request-context';

@ApiTags('Activity')
@ApiBearerAuth()
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: 'Get activity logs (scoped by role)' })
  findAll(
    @Query(new ZodValidationPipe(ActivityQuerySchema)) query: ActivityQuery,
    @CurrentUser() caller: JwtPayload,
  ) {
    const { correlationId } = getRequestContext()!;
    return this.activityService.findAll(query, caller, correlationId);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get activity logs for a specific customer' })
  findByCustomer(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Query(new ZodValidationPipe(ActivityQuerySchema)) query: ActivityQuery,
    @CurrentUser() caller: JwtPayload,
  ) {
    const { correlationId } = getRequestContext()!;
    return this.activityService.findByCustomer(customerId, query, caller, correlationId);
  }
}
