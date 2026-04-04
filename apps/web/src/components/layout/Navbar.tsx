// src/components/layout/Navbar.tsx — pure UI, logout logic in useAuth
'use client';
import { Menu } from 'lucide-react';
import { useCurrentUser, useAuth, useAppDispatch } from '@/hooks';
import { toggleSidebar } from '@/store/slices/ui.slice';
import { Button }    from '@/components/ui/button';
import { RoleBadge } from '@/components/ui/role-badge';

export function Navbar() {
  const dispatch            = useAppDispatch();
  const { user, isSuperAdmin, activeOrgId } = useCurrentUser();
  const { logout, isLoading: loggingOut }   = useAuth();

  return (
    <header className="h-16 border-b bg-card flex items-center px-6 gap-4 sticky top-0 z-20">
      <Button variant="ghost" size="icon" onClick={() => dispatch(toggleSidebar())} aria-label="Toggle sidebar">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      {isSuperAdmin && (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-xs font-medium text-destructive">
            {activeOrgId ? 'Scoped view' : 'Global view'}
          </span>
        </div>
      )}

      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-tight">{user.name}</p>
            <div className="flex justify-end mt-0.5"><RoleBadge role={user.role} /></div>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">{user.name.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      )}

      <Button variant="outline" size="sm" onClick={logout} disabled={loggingOut} isLoading={loggingOut}>
        {loggingOut ? '' : 'Sign out'}
      </Button>
    </header>
  );
}
