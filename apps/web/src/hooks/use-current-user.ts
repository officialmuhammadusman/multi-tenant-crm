// src/hooks/use-current-user.ts
// Single hook for all role/permission checks across the app.
// Components read from here — never from the store directly.
import { useAppSelector } from './use-app-store';
import type { User } from '@crm/types';

export interface CurrentUser {
  user:             User | null;
  activeOrgId:      string | null;
  isAuthenticated:  boolean;
  isSuperAdmin:     boolean;
  isAdmin:          boolean;    // true for ADMIN and SUPER_ADMIN
  isMember:         boolean;
  role:             string | null;
  // Permission helpers — use these in components, not raw role checks
  canCreateCustomer:  boolean;
  canEditCustomer:    (assignedTo: string | null) => boolean;
  canDeleteCustomer:  boolean;
  canRestoreCustomer: boolean;
  canAssignCustomer:  boolean;
  canCreateUser:      boolean;
  canManageOrgs:      boolean;
  canViewGlobalData:  boolean;
}

export function useCurrentUser(): CurrentUser {
  const user        = useAppSelector((s) => s.auth.user);
  const activeOrgId = useAppSelector((s) => s.auth.activeOrgId);

  const isSuperAdmin = user?.isSuperAdmin ?? false;
  const isAdmin      = user?.role === 'ADMIN' || isSuperAdmin;
  const isMember     = user?.role === 'MEMBER';

  return {
    user,
    activeOrgId,
    isAuthenticated:  !!user,
    isSuperAdmin,
    isAdmin,
    isMember,
    role: user?.role ?? null,

    // Permission helpers — centralised, tested once, used everywhere
    canCreateCustomer:  !!user,
    canEditCustomer:    (assignedTo) =>
      isSuperAdmin || isAdmin || (isMember && assignedTo === user?.id),
    canDeleteCustomer:  isAdmin || isSuperAdmin,
    canRestoreCustomer: isAdmin || isSuperAdmin,
    canAssignCustomer:  isAdmin || isSuperAdmin,
    canCreateUser:      isAdmin || isSuperAdmin,
    canManageOrgs:      isSuperAdmin,
    canViewGlobalData:  isSuperAdmin,
  };
}
