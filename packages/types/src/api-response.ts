// packages/types/src/api-response.ts
// Every endpoint returns this shape. No inline response objects anywhere.

export interface FieldError {
  field: string;
  message: string;
}

export interface PaginationMeta {
  cursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface ResponseMeta {
  timestamp: string;
  correlationId: string;
  pagination?: PaginationMeta;
}

export interface ApiResponseShape<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  error: string | null;
  errors: FieldError[] | null;
  meta: ResponseMeta | null;
}

export class ApiResponse {
  static success<T>(
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: Partial<ResponseMeta>,
  ): ApiResponseShape<T> {
    return {
      success: true,
      statusCode,
      message,
      data,
      error: null,
      errors: null,
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: meta?.correlationId ?? '',
        ...(meta?.pagination ? { pagination: meta.pagination } : {}),
      },
    };
  }

  static created<T>(data: T, message = 'Created successfully'): ApiResponseShape<T> {
    return ApiResponse.success(data, message, 201);
  }

  static error(
    message: string,
    statusCode = 400,
    errors: FieldError[] | null = null,
    correlationId = '',
  ): ApiResponseShape<null> {
    return {
      success: false,
      statusCode,
      message,
      data: null,
      error: message,
      errors,
      meta: {
        timestamp: new Date().toISOString(),
        correlationId,
      },
    };
  }

  static paginated<T>(
    data: T[],
    nextCursor: string | null,
    hasMore: boolean,
    limit: number,
    message = 'Success',
    correlationId = '',
  ): ApiResponseShape<T[]> {
    return {
      success: true,
      statusCode: 200,
      message,
      data,
      error: null,
      errors: null,
      meta: {
        timestamp: new Date().toISOString(),
        correlationId,
        pagination: { cursor: nextCursor, hasMore, limit },
      },
    };
  }
}
