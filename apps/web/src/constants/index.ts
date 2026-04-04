// src/constants/index.ts
// Every magic value lives here. Nothing is hardcoded in components.

// ── Pagination ────────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE   = 20;
export const MAX_PAGE_SIZE       = 100;

// ── Assignment ────────────────────────────────────────────────────────────────
export const MAX_CUSTOMER_ASSIGNMENTS = 5;

// ── Search ────────────────────────────────────────────────────────────────────
export const SEARCH_DEBOUNCE_MS = 300;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const AUTH_ROLE_COOKIE        = 'crm_auth_role';
export const COOKIE_MAX_AGE_7_DAYS   = 7 * 24 * 60 * 60;      // seconds
export const TOKEN_REFRESH_BUFFER_MS = 60_000;                 // refresh 60s before expiry
export const ACCESS_TOKEN_EXPIRY_MS  = 15 * 60 * 1000;        // 15 minutes

// ── Toast messages ────────────────────────────────────────────────────────────
export const TOAST = {
  login: {
    success: (name: string) => `Welcome back, ${name}`,
    error:   'Invalid email or password',
  },
  customer: {
    created:  'Customer created successfully',
    updated:  'Customer updated successfully',
    deleted:  'Customer deleted',
    restored: 'Customer restored',
    assigned: 'Customer assigned successfully',
  },
  note: {
    created: 'Note added',
  },
  user: {
    created: (name: string) => `User ${name} created`,
  },
  organization: {
    created: (name: string) => `Organization "${name}" created`,
  },
  auth: {
    sessionExpired:  'Session expired. Please log in again.',
    logoutSuccess:   'Logged out successfully',
    networkError:    'Network error — please check your connection',
  },
} as const;

// ── Role labels ───────────────────────────────────────────────────────────────
export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN:       'Admin',
  MEMBER:      'Member',
};

// ── Assignable roles (SUPER_ADMIN is seeded only, never created via UI) ───────
export const ASSIGNABLE_ROLES = ['ADMIN', 'MEMBER'] as const;

// ── Query keys (for cache invalidation consistency) ───────────────────────────
export const QUERY_KEYS = {
  customers:     'customers',
  customer:      (id: string) => `customer-${id}`,
  notes:         (customerId: string) => `notes-${customerId}`,
  activity:      'activity',
  customerActivity: (id: string) => `activity-${id}`,
  users:         'users',
  organizations: 'organizations',
} as const;

// ── API timeout ───────────────────────────────────────────────────────────────
export const API_TIMEOUT_MS = 15_000;

// ── Table empty messages ──────────────────────────────────────────────────────
export const EMPTY_MESSAGES = {
  customers:     'No customers found.',
  notes:         'No notes yet — add one below.',
  activity:      'No activity recorded.',
  users:         'No users found.',
  organizations: 'No organizations found.',
} as const;
