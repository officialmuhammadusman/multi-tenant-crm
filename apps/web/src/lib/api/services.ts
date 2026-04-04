// src/lib/api/services.ts
// All API calls live here. Components and hooks NEVER call axios directly.
// Uses types from @crm/types (monorepo) — zero type duplication.

import axiosInstance from './axios-instance';
import { buildQueryString } from '../utils';
import { API } from '../api-routes';
import type {
  LoginDto,
  TokenResponse,
  CreateCustomerDto,
  UpdateCustomerDto,
  AssignCustomerDto,
  CreateNoteDto,
  CreateUserDto,
  CreateOrganizationDto,
  PaginationQuery,
  ActivityQuery,
  ApiResponseShape,
  Customer,
  CustomerWithNotes,
  Note,
  ActivityLog,
  User,
  Organization,
  CursorResponse,
} from '@crm/types';

// ── Generic unwrapper ─────────────────────────────────────────────────────────
// Every backend response is wrapped in ApiResponseShape<T>.
// This strips the wrapper so hooks/components receive T directly.
async function unwrap<T>(
  request: Promise<{ data: ApiResponseShape<T> }>,
): Promise<T> {
  const { data } = await request;
  if (!data.success || data.data === null || data.data === undefined) {
    throw new Error(data.message ?? 'Request failed');
  }
  return data.data;
}

// ── Auth service ──────────────────────────────────────────────────────────────
export const authService = {
  login:   (dto: LoginDto)  => unwrap<TokenResponse>(axiosInstance.post(API.auth.login, dto)),
  logout:  ()               => axiosInstance.post(API.auth.logout),
  refresh: ()               => unwrap<{ accessToken: string }>(axiosInstance.post(API.auth.refresh)),
  getMe:   ()               => unwrap<User>(axiosInstance.get(API.users.me)),
};

// ── Customer service ──────────────────────────────────────────────────────────
export const customerService = {
  list: (q: PaginationQuery) =>
    unwrap<CursorResponse<Customer>>(
      axiosInstance.get(`${API.customers.list}?${buildQueryString(q as Record<string, unknown>)}`),
    ),

  getOne: (id: string) =>
    unwrap<CustomerWithNotes>(axiosInstance.get(API.customers.detail(id))),

  create: (dto: CreateCustomerDto) =>
    unwrap<Customer>(axiosInstance.post(API.customers.create, dto)),

  update: (id: string, dto: UpdateCustomerDto) =>
    unwrap<Customer>(axiosInstance.patch(API.customers.update(id), dto)),

  softDelete: (id: string) =>
    axiosInstance.delete(API.customers.delete(id)),

  restore: (id: string) =>
    unwrap<Customer>(axiosInstance.post(API.customers.restore(id))),

  assign: (id: string, dto: AssignCustomerDto) =>
    unwrap<Customer>(axiosInstance.post(API.customers.assign(id), dto)),
};

// ── Note service ──────────────────────────────────────────────────────────────
export const noteService = {
  create: (dto: CreateNoteDto) =>
    unwrap<Note>(axiosInstance.post(API.notes.create, dto)),

  byCustomer: (customerId: string) =>
    unwrap<Note[]>(axiosInstance.get(API.notes.byCustomer(customerId))),
};

// ── Activity service ──────────────────────────────────────────────────────────
export const activityService = {
  list: (q: ActivityQuery) =>
    unwrap<CursorResponse<ActivityLog>>(
      axiosInstance.get(`${API.activity.list}?${buildQueryString(q as Record<string, unknown>)}`),
    ),

  byCustomer: (id: string, q?: PaginationQuery) =>
    unwrap<CursorResponse<ActivityLog>>(
      axiosInstance.get(
        `${API.activity.byCustomer(id)}?${buildQueryString((q ?? {}) as Record<string, unknown>)}`,
      ),
    ),
};

// ── User service ──────────────────────────────────────────────────────────────
export const userService = {
  list: (organizationId?: string) =>
    unwrap<User[]>(
      axiosInstance.get(
        API.users.list + (organizationId ? `?organizationId=${organizationId}` : ''),
      ),
    ),

  create: (dto: CreateUserDto) =>
    unwrap<User>(axiosInstance.post(API.users.create, dto)),

  getMe: () =>
    unwrap<User>(axiosInstance.get(API.users.me)),
};

// ── Organization service ──────────────────────────────────────────────────────
export const organizationService = {
  list: () =>
    unwrap<Organization[]>(axiosInstance.get(API.organizations.list)),

  getOne: (id: string) =>
    unwrap<Organization>(axiosInstance.get(API.organizations.detail(id))),

  create: (dto: CreateOrganizationDto) =>
    unwrap<Organization>(axiosInstance.post(API.organizations.create, dto)),
};
