// apps/api/src/notes/notes.controller.ts
import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../common/decorators';
import { CreateNoteSchema, CreateNoteDto, JwtPayload } from '@crm/types';
import { getRequestContext } from '../common/context/request-context';

@ApiTags('Notes')
@ApiBearerAuth()
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a note on a customer' })
  create(
    @Body(new ZodValidationPipe(CreateNoteSchema)) dto: CreateNoteDto,
    @CurrentUser() caller: JwtPayload,
  ) {
    const { correlationId } = getRequestContext()!;
    return this.notesService.create(dto, caller, correlationId);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get all notes for a customer' })
  findByCustomer(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @CurrentUser() caller: JwtPayload,
  ) {
    const { correlationId } = getRequestContext()!;
    return this.notesService.findByCustomer(customerId, caller, correlationId);
  }
}
