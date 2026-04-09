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
export declare class ApiResponse {
    static success<T>(data: T, message?: string, statusCode?: number, meta?: Partial<ResponseMeta>): ApiResponseShape<T>;
    static created<T>(data: T, message?: string): ApiResponseShape<T>;
    static error(message: string, statusCode?: number, errors?: FieldError[] | null, correlationId?: string): ApiResponseShape<null>;
    static paginated<T>(data: T[], nextCursor: string | null, hasMore: boolean, limit: number, message?: string, correlationId?: string): ApiResponseShape<T[]>;
}
//# sourceMappingURL=api-response.d.ts.map