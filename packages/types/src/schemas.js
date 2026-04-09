"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityLabel = exports.ACTIVITY_LABELS = exports.ActivityQuerySchema = exports.PaginationQuerySchema = exports.ActivityLogSchema = exports.CreateNoteSchema = exports.AssignCustomerSchema = exports.UpdateCustomerSchema = exports.CreateCustomerSchema = exports.CustomerWithNotesSchema = exports.NoteSchema = exports.CustomerSchema = exports.TokenResponseSchema = exports.JwtPayloadSchema = exports.LoginSchema = exports.UpdateUserSchema = exports.CreateUserSchema = exports.UserPublicSchema = exports.UserSchema = exports.CreateOrganizationSchema = exports.OrganizationSchema = exports.EnvSchema = exports.ActivityActionSchema = exports.UserRoleSchema = void 0;
exports.buildCursorResponse = buildCursorResponse;
// packages/types/src/schemas.ts
const zod_1 = require("zod");
// ─── Enums ───────────────────────────────────────────────────────────────────
exports.UserRoleSchema = zod_1.z.enum(['SUPER_ADMIN', 'ADMIN', 'MEMBER']);
exports.ActivityActionSchema = zod_1.z.enum([
    'CUSTOMER_CREATED',
    'CUSTOMER_UPDATED',
    'CUSTOMER_DELETED',
    'CUSTOMER_RESTORED',
    'NOTE_ADDED',
    'CUSTOMER_ASSIGNED',
]);
// ─── Environment ──────────────────────────────────────────────────────────────
exports.EnvSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url('DATABASE_URL must be a valid URL'),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: zod_1.z.string().default('15m'),
    REFRESH_TOKEN_EXPIRES_DAYS: zod_1.z.coerce.number().default(7),
    REDIS_URL: zod_1.z.string().url('REDIS_URL must be a valid URL'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(3001),
    FRONTEND_URL: zod_1.z.string().url().default('http://localhost:3000'),
});
// ─── Organization ─────────────────────────────────────────────────────────────
exports.OrganizationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(100),
    createdAt: zod_1.z.coerce.date(),
});
exports.CreateOrganizationSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'Organization name must be at least 2 characters')
        .max(100, 'Organization name too long'),
});
// ─── User ─────────────────────────────────────────────────────────────────────
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(100),
    email: zod_1.z.string().email(),
    role: exports.UserRoleSchema,
    isSuperAdmin: zod_1.z.boolean(),
    organizationId: zod_1.z.string().uuid().nullable(),
    createdAt: zod_1.z.coerce.date(),
});
exports.UserPublicSchema = exports.UserSchema.omit({ isSuperAdmin: true });
exports.CreateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    role: exports.UserRoleSchema.default('MEMBER'),
});
exports.UpdateUserSchema = exports.CreateUserSchema.partial().omit({ password: true });
// ─── Auth ─────────────────────────────────────────────────────────────────────
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.JwtPayloadSchema = zod_1.z.object({
    sub: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    role: exports.UserRoleSchema,
    isSuperAdmin: zod_1.z.boolean(),
    organizationId: zod_1.z.string().uuid().nullable(),
    jti: zod_1.z.string().uuid(),
    iat: zod_1.z.number().optional(),
    exp: zod_1.z.number().optional(),
});
exports.TokenResponseSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
    user: exports.UserSchema,
});
// ─── Customer ─────────────────────────────────────────────────────────────────
exports.CustomerSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(200),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().max(30).nullable(),
    organizationId: zod_1.z.string().uuid(),
    assignedTo: zod_1.z.string().uuid().nullable(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
    deletedAt: zod_1.z.coerce.date().nullable(),
});
exports.NoteSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    content: zod_1.z.string().min(1).max(2000),
    customerId: zod_1.z.string().uuid(),
    organizationId: zod_1.z.string().uuid(),
    createdBy: zod_1.z.string().uuid(),
    createdAt: zod_1.z.coerce.date(),
});
exports.CustomerWithNotesSchema = exports.CustomerSchema.extend({
    notes: zod_1.z.array(exports.NoteSchema),
    assignedUser: exports.UserPublicSchema.nullable().optional(),
    organization: exports.OrganizationSchema.optional(),
});
exports.CreateCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(200, 'Name too long'),
    email: zod_1.z.string().email('Invalid email address'),
    phone: zod_1.z.string().max(30, 'Phone too long').optional().nullable(),
});
exports.UpdateCustomerSchema = exports.CreateCustomerSchema.partial();
exports.AssignCustomerSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID'),
});
// ─── Note ─────────────────────────────────────────────────────────────────────
exports.CreateNoteSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Content is required').max(2000, 'Content too long (max 2000 chars)'),
    customerId: zod_1.z.string().uuid('Invalid customer ID'),
});
// ─── Activity Log ─────────────────────────────────────────────────────────────
exports.ActivityLogSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    entityType: zod_1.z.string(),
    entityId: zod_1.z.string().uuid(),
    action: exports.ActivityActionSchema,
    label: zod_1.z.string(), // computed server-side, e.g. "Customer Created"
    performedBy: zod_1.z.string().uuid(),
    organizationId: zod_1.z.string().uuid(),
    timestamp: zod_1.z.coerce.date(),
    performer: exports.UserPublicSchema.optional(),
    organization: exports.OrganizationSchema.optional(),
});
// ─── Pagination ───────────────────────────────────────────────────────────────
exports.PaginationQuerySchema = zod_1.z.object({
    cursor: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    search: zod_1.z.string().max(200).optional(),
    organizationId: zod_1.z.string().uuid().optional(), // super admin filter
});
exports.ActivityQuerySchema = exports.PaginationQuerySchema.extend({
    action: exports.ActivityActionSchema.optional(),
    entityType: zod_1.z.string().optional(),
    performedBy: zod_1.z.string().uuid().optional(),
});
function buildCursorResponse(data, nextCursor, hasMore) {
    return { data, nextCursor, hasMore };
}
// ─── ACTIVITY LABELS (re-export for convenience) ─────────────────────────────
var activity_labels_1 = require("./activity-labels");
Object.defineProperty(exports, "ACTIVITY_LABELS", { enumerable: true, get: function () { return activity_labels_1.ACTIVITY_LABELS; } });
Object.defineProperty(exports, "getActivityLabel", { enumerable: true, get: function () { return activity_labels_1.getActivityLabel; } });
//# sourceMappingURL=schemas.js.map