"use strict";
// packages/types/src/api-response.ts
// Every endpoint returns this shape. No inline response objects anywhere.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    static success(data, message = 'Success', statusCode = 200, meta) {
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
    static created(data, message = 'Created successfully') {
        return ApiResponse.success(data, message, 201);
    }
    static error(message, statusCode = 400, errors = null, correlationId = '') {
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
    static paginated(data, nextCursor, hasMore, limit, message = 'Success', correlationId = '') {
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
exports.ApiResponse = ApiResponse;
//# sourceMappingURL=api-response.js.map