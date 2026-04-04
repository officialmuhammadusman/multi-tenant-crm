// src/lib/routes.ts
export const ROUTES = {
  auth:      { login: '/login' },
  customers: {
    list:   '/customers',
    detail: (id: string) => `/customers/${id}`,
    edit:   (id: string) => `/customers/${id}/edit`,
  },
  activity:  { list: '/activity' },
  users:     { list: '/users' },
  admin:     { organizations: '/admin/organizations' },
  superadmin: {
    customers:     '/superadmin/customers',
    organizations: '/superadmin/organizations',
    activity:      '/superadmin/activity',
  },
} as const;

export const PROTECTED_ROUTES   = ['/customers', '/activity', '/users', '/admin', '/superadmin'];
export const ADMIN_ROUTES       = ['/admin'];
export const SUPERADMIN_ROUTES  = ['/superadmin'];
