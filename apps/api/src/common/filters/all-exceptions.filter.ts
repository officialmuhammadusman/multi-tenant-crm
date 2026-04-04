// apps/api/src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';
import { ApiResponse, FieldError } from '@crm/types';
import { getRequestContext } from '../context/request-context';
import { Prisma } from '@crm/db';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const context = getRequestContext();
    const correlationId = context?.correlationId ?? '';
    const isDev = process.env['NODE_ENV'] === 'development';

    // ── ZodError ──────────────────────────────────────────────────────────
    if (exception instanceof ZodError) {
      const fieldErrors: FieldError[] = exception.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      response.status(400).json(ApiResponse.error('Validation failed', 400, fieldErrors, correlationId));
      return;
    }

    // ── Prisma errors ─────────────────────────────────────────────────────
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        response.status(409).json(ApiResponse.error('A record with this value already exists', 409, null, correlationId));
        return;
      }
      if (exception.code === 'P2025') {
        response.status(404).json(ApiResponse.error('Record not found', 404, null, correlationId));
        return;
      }
      if (exception.code === 'P2003') {
        response.status(400).json(ApiResponse.error('Invalid reference: related record not found', 400, null, correlationId));
        return;
      }
      this.logger.error(`Prisma error ${exception.code}`, isDev ? exception.stack : '');
      response.status(500).json(ApiResponse.error('Database error', 500, null, correlationId));
      return;
    }

    // ── NestJS HttpException ──────────────────────────────────────────────
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      let message: string;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const body = exceptionResponse as Record<string, unknown>;
        message = typeof body['message'] === 'string'
          ? body['message']
          : Array.isArray(body['message'])
            ? (body['message'] as string[]).join(', ')
            : exception.message;
      } else {
        message = exception.message;
      }

      response.status(status).json(ApiResponse.error(message, status, null, correlationId));
      return;
    }

    // ── Unknown / unhandled errors ─────────────────────────────────────────
    const err = exception instanceof Error ? exception : new Error(String(exception));
    this.logger.error('Unhandled exception', isDev ? err.stack : err.message);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      ApiResponse.error(
        isDev ? err.message : 'Internal server error',
        500,
        null,
        correlationId,
      ),
    );
  }
}
