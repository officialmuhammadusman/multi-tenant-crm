// packages/types/src/schemas.ts
import { z } from 'zod';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const UserRoleSchema = z.enum(['SUPER_ADMIN', 'ADMIN', 'MEMBER']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const ActivityActionSchema = z.enum([
  'CUSTOMER_CREATED',
  'CUSTOMER_UPDATED',
  'CUSTOMER_DELETED',
  'CUSTOMER_RESTORED',
  'NOTE_ADDED',
  'CUSTOMER_ASSIGNED',
]);
export type ActivityActionType = z.infer<typeof ActivityActionSchema>;

// ─── Environment ──────────────────────────────────────────────────────────────

export const EnvSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(7),
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
});
export type Env = z.infer<typeof EnvSchema>;

// ─── Organization ─────────────────────────────────────────────────────────────

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  createdAt: z.coerce.date(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const CreateOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name too long'),
});
export type CreateOrganizationDto = z.infer<typeof CreateOrganizationSchema>;

// ─── User ─────────────────────────────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: UserRoleSchema,
  isSuperAdmin: z.boolean(),
  organizationId: z.string().uuid().nullable(),
  createdAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

export const UserPublicSchema = UserSchema.omit({ isSuperAdmin: true });
export type UserPublic = z.infer<typeof UserPublicSchema>;

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: UserRoleSchema.default('MEMBER'),
});
export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = CreateUserSchema.partial().omit({ password: true });
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginDto = z.infer<typeof LoginSchema>;

export const JwtPayloadSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  role: UserRoleSchema,
  isSuperAdmin: z.boolean(),
  organizationId: z.string().uuid().nullable(),
  jti: z.string().uuid(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

export const TokenResponseSchema = z.object({
  accessToken: z.string(),
  user: UserSchema,
});
export type TokenResponse = z.infer<typeof TokenResponseSchema>;

// ─── Customer ─────────────────────────────────────────────────────────────────

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(30).nullable(),
  organizationId: z.string().uuid(),
  assignedTo: z.string().uuid().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});
export type Customer = z.infer<typeof CustomerSchema>;

export const NoteSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(2000),
  customerId: z.string().uuid(),
  organizationId: z.string().uuid(),
  createdBy: z.string().uuid(),
  createdAt: z.coerce.date(),
});
export type Note = z.infer<typeof NoteSchema>;

export const CustomerWithNotesSchema = CustomerSchema.extend({
  notes: z.array(NoteSchema),
  assignedUser: UserPublicSchema.nullable().optional(),
  organization: OrganizationSchema.optional(),
});
export type CustomerWithNotes = z.infer<typeof CustomerWithNotesSchema>;

export const CreateCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(30, 'Phone too long').optional().nullable(),
});
export type CreateCustomerDto = z.infer<typeof CreateCustomerSchema>;

export const UpdateCustomerSchema = CreateCustomerSchema.partial();
export type UpdateCustomerDto = z.infer<typeof UpdateCustomerSchema>;

export const AssignCustomerSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});
export type AssignCustomerDto = z.infer<typeof AssignCustomerSchema>;

// ─── Note ─────────────────────────────────────────────────────────────────────

export const CreateNoteSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content too long (max 2000 chars)'),
  customerId: z.string().uuid('Invalid customer ID'),
});
export type CreateNoteDto = z.infer<typeof CreateNoteSchema>;

// ─── Activity Log ─────────────────────────────────────────────────────────────

export const ActivityLogSchema = z.object({
  id: z.string().uuid(),
  entityType: z.string(),
  entityId: z.string().uuid(),
  action: ActivityActionSchema,
  label: z.string(), // computed server-side, e.g. "Customer Created"
  performedBy: z.string().uuid(),
  organizationId: z.string().uuid(),
  timestamp: z.coerce.date(),
  performer: UserPublicSchema.optional(),
  organization: OrganizationSchema.optional(),
});
export type ActivityLog = z.infer<typeof ActivityLogSchema>;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const PaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  organizationId: z.string().uuid().optional(), // super admin filter
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const ActivityQuerySchema = PaginationQuerySchema.extend({
  action: ActivityActionSchema.optional(),
  entityType: z.string().optional(),
  performedBy: z.string().uuid().optional(),
});
export type ActivityQuery = z.infer<typeof ActivityQuerySchema>;

export type CursorResponse<T> = {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

export function buildCursorResponse<T>(
  data: T[],
  nextCursor: string | null,
  hasMore: boolean,
): CursorResponse<T> {
  return { data, nextCursor, hasMore };
}

// ─── ACTIVITY LABELS (re-export for convenience) ─────────────────────────────
export { ACTIVITY_LABELS, getActivityLabel } from './activity-labels';
