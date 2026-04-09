import { z } from 'zod';
export declare const UserRoleSchema: z.ZodEnum<["SUPER_ADMIN", "ADMIN", "MEMBER"]>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export declare const ActivityActionSchema: z.ZodEnum<["CUSTOMER_CREATED", "CUSTOMER_UPDATED", "CUSTOMER_DELETED", "CUSTOMER_RESTORED", "NOTE_ADDED", "CUSTOMER_ASSIGNED"]>;
export type ActivityActionType = z.infer<typeof ActivityActionSchema>;
export declare const EnvSchema: z.ZodObject<{
    DATABASE_URL: z.ZodString;
    JWT_SECRET: z.ZodString;
    JWT_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    REFRESH_TOKEN_EXPIRES_DAYS: z.ZodDefault<z.ZodNumber>;
    REDIS_URL: z.ZodString;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    FRONTEND_URL: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    REFRESH_TOKEN_EXPIRES_DAYS: number;
    REDIS_URL: string;
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    FRONTEND_URL: string;
}, {
    DATABASE_URL: string;
    JWT_SECRET: string;
    REDIS_URL: string;
    JWT_EXPIRES_IN?: string | undefined;
    REFRESH_TOKEN_EXPIRES_DAYS?: number | undefined;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    PORT?: number | undefined;
    FRONTEND_URL?: string | undefined;
}>;
export type Env = z.infer<typeof EnvSchema>;
export declare const OrganizationSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: Date;
}, {
    id: string;
    name: string;
    createdAt: Date;
}>;
export type Organization = z.infer<typeof OrganizationSchema>;
export declare const CreateOrganizationSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export type CreateOrganizationDto = z.infer<typeof CreateOrganizationSchema>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    role: z.ZodEnum<["SUPER_ADMIN", "ADMIN", "MEMBER"]>;
    isSuperAdmin: z.ZodBoolean;
    organizationId: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: Date;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
    isSuperAdmin: boolean;
    organizationId: string | null;
}, {
    id: string;
    name: string;
    createdAt: Date;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
    isSuperAdmin: boolean;
    organizationId: string | null;
}>;
export type User = z.infer<typeof UserSchema>;
export declare const UserPublicSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    role: z.ZodEnum<["SUPER_ADMIN", "ADMIN", "MEMBER"]>;
    isSuperAdmin: z.ZodBoolean;
    organizationId: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
}, "isSuperAdmin">, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: Date;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
    organizationId: string | null;
}, {
    id: string;
    name: string;
    createdAt: Date;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
    organizationId: string | null;
}>;
export type UserPublic = z.infer<typeof UserPublicSchema>;
export declare const CreateUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["SUPER_ADMIN", "ADMIN", "MEMBER"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
    password: string;
}, {
    name: string;
    email: string;
    password: string;
    role?: "SUPER_ADMIN" | "ADMIN" | "MEMBER" | undefined;
}>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export declare const UpdateUserSchema: z.ZodObject<Omit<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodDefault<z.ZodEnum<["SUPER_ADMIN", "ADMIN", "MEMBER"]>>>;
}, "password">, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    role?: "SUPER_ADMIN" | "ADMIN" | "MEMBER" | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    role?: "SUPER_ADMIN" | "ADMIN" | "MEMBER" | undefined;
}>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginDto = z.infer<typeof LoginSchema>;
export declare const JwtPayloadSchema: z.ZodObject<{
    sub: z.ZodString;
    email: z.ZodString;
    role: z.ZodEnum<["SUPER_ADMIN", "ADMIN", "MEMBER"]>;
    isSuperAdmin: z.ZodBoolean;
    organizationId: z.ZodNullable<z.ZodString>;
    jti: z.ZodString;
    iat: z.ZodOptional<z.ZodNumber>;
    exp: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sub: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
    isSuperAdmin: boolean;
    organizationId: string | null;
    jti: string;
    iat?: number | undefined;
    exp?: number | undefined;
}, {
    sub: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
    isSuperAdmin: boolean;
    organizationId: string | null;
    jti: string;
    iat?: number | undefined;
    exp?: number | undefined;
}>;
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
export declare const TokenResponseSchema: z.ZodObject<{
    accessToken: z.ZodString;
    user: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
        role: z.ZodEnum<["SUPER_ADMIN", "ADMIN", "MEMBER"]>;
        isSuperAdmin: z.ZodBoolean;
        organizationId: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
        isSuperAdmin: boolean;
        organizationId: string | null;
    }, {
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
        isSuperAdmin: boolean;
        organizationId: string | null;
    }>;
}, "strip", z.ZodTypeAny, {
    user: {
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
        isSuperAdmin: boolean;
        organizationId: string | null;
    };
    accessToken: string;
}, {
    user: {
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
        isSuperAdmin: boolean;
        organizationId: string | null;
    };
    accessToken: string;
}>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export declare const CustomerSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodNullable<z.ZodString>;
    organizationId: z.ZodString;
    assignedTo: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    deletedAt: z.ZodNullable<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: Date;
    email: string;
    organizationId: string;
    phone: string | null;
    assignedTo: string | null;
    updatedAt: Date;
    deletedAt: Date | null;
}, {
    id: string;
    name: string;
    createdAt: Date;
    email: string;
    organizationId: string;
    phone: string | null;
    assignedTo: string | null;
    updatedAt: Date;
    deletedAt: Date | null;
}>;
export type Customer = z.infer<typeof CustomerSchema>;
export declare const NoteSchema: z.ZodObject<{
    id: z.ZodString;
    content: z.ZodString;
    customerId: z.ZodString;
    organizationId: z.ZodString;
    createdBy: z.ZodString;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    organizationId: string;
    content: string;
    customerId: string;
    createdBy: string;
}, {
    id: string;
    createdAt: Date;
    organizationId: string;
    content: string;
    customerId: string;
    createdBy: string;
}>;
export type Note = z.infer<typeof NoteSchema>;
export declare const CustomerWithNotesSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodNullable<z.ZodString>;
    organizationId: z.ZodString;
    assignedTo: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    deletedAt: z.ZodNullable<z.ZodDate>;
} & {
    notes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        content: z.ZodString;
        customerId: z.ZodString;
        organizationId: z.ZodString;
        createdBy: z.ZodString;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        organizationId: string;
        content: string;
        customerId: string;
        createdBy: string;
    }, {
        id: string;
        createdAt: Date;
        organizationId: string;
        content: string;
        customerId: string;
        createdBy: string;
    }>, "many">;
    assignedUser: z.ZodOptional<z.ZodNullable<z.ZodObject<Omit<{
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
        role: z.ZodEnum<["SUPER_ADMIN", "ADMIN", "MEMBER"]>;
        isSuperAdmin: z.ZodBoolean;
        organizationId: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodDate;
    }, "isSuperAdmin">, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
        organizationId: string | null;
    }, {
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
        organizationId: string | null;
    }>>>;
    organization: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        createdAt: Date;
    }, {
        id: string;
        name: string;
        createdAt: Date;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: Date;
    email: string;
    organizationId: string;
    phone: string | null;
    assignedTo: string | null;
    updatedAt: Date;
    deletedAt: Date | null;
    notes: {
        id: string;
        createdAt: Date;
        organizationId: string;
        content: string;
        customerId: string;
        createdBy: string;
    }[];
    organization?: {
        id: string;
        name: string;
        createdAt: Date;
    } | undefined;
    assignedUser?: {
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
        organizationId: string | null;
    } | null | undefined;
}, {
    id: string;
    name: string;
    createdAt: Date;
    email: string;
    organizationId: string;
    phone: string | null;
    assignedTo: string | null;
    updatedAt: Date;
    deletedAt: Date | null;
    notes: {
        id: string;
        createdAt: Date;
        organizationId: string;
        content: string;
        customerId: string;
        createdBy: string;
    }[];
    organization?: {
        id: string;
        name: string;
        createdAt: Date;
    } | undefined;
    assignedUser?: {
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
        organizationId: string | null;
    } | null | undefined;
}>;
export type CustomerWithNotes = z.infer<typeof CustomerWithNotesSchema>;
export declare const CreateCustomerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    phone?: string | null | undefined;
}, {
    name: string;
    email: string;
    phone?: string | null | undefined;
}>;
export type CreateCustomerDto = z.infer<typeof CreateCustomerSchema>;
export declare const UpdateCustomerSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | null | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | null | undefined;
}>;
export type UpdateCustomerDto = z.infer<typeof UpdateCustomerSchema>;
export declare const AssignCustomerSchema: z.ZodObject<{
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
}, {
    userId: string;
}>;
export type AssignCustomerDto = z.infer<typeof AssignCustomerSchema>;
export declare const CreateNoteSchema: z.ZodObject<{
    content: z.ZodString;
    customerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
    customerId: string;
}, {
    content: string;
    customerId: string;
}>;
export type CreateNoteDto = z.infer<typeof CreateNoteSchema>;
export declare const ActivityLogSchema: z.ZodObject<{
    id: z.ZodString;
    entityType: z.ZodString;
    entityId: z.ZodString;
    action: z.ZodEnum<["CUSTOMER_CREATED", "CUSTOMER_UPDATED", "CUSTOMER_DELETED", "CUSTOMER_RESTORED", "NOTE_ADDED", "CUSTOMER_ASSIGNED"]>;
    label: z.ZodString;
    performedBy: z.ZodString;
    organizationId: z.ZodString;
    timestamp: z.ZodDate;
    performer: z.ZodOptional<z.ZodObject<Omit<{
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
        role: z.ZodEnum<["SUPER_ADMIN", "ADMIN", "MEMBER"]>;
        isSuperAdmin: z.ZodBoolean;
        organizationId: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodDate;
    }, "isSuperAdmin">, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
        organizationId: string | null;
    }, {
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
        organizationId: string | null;
    }>>;
    organization: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        createdAt: Date;
    }, {
        id: string;
        name: string;
        createdAt: Date;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    organizationId: string;
    entityType: string;
    entityId: string;
    action: "CUSTOMER_CREATED" | "CUSTOMER_UPDATED" | "CUSTOMER_DELETED" | "CUSTOMER_RESTORED" | "NOTE_ADDED" | "CUSTOMER_ASSIGNED";
    label: string;
    performedBy: string;
    timestamp: Date;
    organization?: {
        id: string;
        name: string;
        createdAt: Date;
    } | undefined;
    performer?: {
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
        organizationId: string | null;
    } | undefined;
}, {
    id: string;
    organizationId: string;
    entityType: string;
    entityId: string;
    action: "CUSTOMER_CREATED" | "CUSTOMER_UPDATED" | "CUSTOMER_DELETED" | "CUSTOMER_RESTORED" | "NOTE_ADDED" | "CUSTOMER_ASSIGNED";
    label: string;
    performedBy: string;
    timestamp: Date;
    organization?: {
        id: string;
        name: string;
        createdAt: Date;
    } | undefined;
    performer?: {
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
        organizationId: string | null;
    } | undefined;
}>;
export type ActivityLog = z.infer<typeof ActivityLogSchema>;
export declare const PaginationQuerySchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    search?: string | undefined;
    organizationId?: string | undefined;
    cursor?: string | undefined;
}, {
    search?: string | undefined;
    organizationId?: string | undefined;
    cursor?: string | undefined;
    limit?: number | undefined;
}>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export declare const ActivityQuerySchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodString>;
} & {
    action: z.ZodOptional<z.ZodEnum<["CUSTOMER_CREATED", "CUSTOMER_UPDATED", "CUSTOMER_DELETED", "CUSTOMER_RESTORED", "NOTE_ADDED", "CUSTOMER_ASSIGNED"]>>;
    entityType: z.ZodOptional<z.ZodString>;
    performedBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    search?: string | undefined;
    organizationId?: string | undefined;
    entityType?: string | undefined;
    action?: "CUSTOMER_CREATED" | "CUSTOMER_UPDATED" | "CUSTOMER_DELETED" | "CUSTOMER_RESTORED" | "NOTE_ADDED" | "CUSTOMER_ASSIGNED" | undefined;
    performedBy?: string | undefined;
    cursor?: string | undefined;
}, {
    search?: string | undefined;
    organizationId?: string | undefined;
    entityType?: string | undefined;
    action?: "CUSTOMER_CREATED" | "CUSTOMER_UPDATED" | "CUSTOMER_DELETED" | "CUSTOMER_RESTORED" | "NOTE_ADDED" | "CUSTOMER_ASSIGNED" | undefined;
    performedBy?: string | undefined;
    cursor?: string | undefined;
    limit?: number | undefined;
}>;
export type ActivityQuery = z.infer<typeof ActivityQuerySchema>;
export type CursorResponse<T> = {
    data: T[];
    nextCursor: string | null;
    hasMore: boolean;
};
export declare function buildCursorResponse<T>(data: T[], nextCursor: string | null, hasMore: boolean): CursorResponse<T>;
export { ACTIVITY_LABELS, getActivityLabel } from './activity-labels';
//# sourceMappingURL=schemas.d.ts.map