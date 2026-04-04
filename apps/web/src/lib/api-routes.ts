// src/lib/api-routes.ts — every backend endpoint as a typed constant
const V1 = '/api/v1';

export const API = {
  auth:          { login: `${V1}/auth/login`, refresh: `${V1}/auth/refresh`, logout: `${V1}/auth/logout` },
  users:         { list: `${V1}/users`, me: `${V1}/users/me`, create: `${V1}/users` },
  organizations: { list: `${V1}/organizations`, detail: (id: string) => `${V1}/organizations/${id}`, create: `${V1}/organizations` },
  customers: {
    list:    `${V1}/customers`,
    detail:  (id: string) => `${V1}/customers/${id}`,
    create:  `${V1}/customers`,
    update:  (id: string) => `${V1}/customers/${id}`,
    delete:  (id: string) => `${V1}/customers/${id}`,
    restore: (id: string) => `${V1}/customers/${id}/restore`,
    assign:  (id: string) => `${V1}/customers/${id}/assign`,
  },
  notes:    { create: `${V1}/notes`, byCustomer: (id: string) => `${V1}/notes/customer/${id}` },
  activity: { list: `${V1}/activity`, byCustomer: (id: string) => `${V1}/activity/customer/${id}` },
} as const;
