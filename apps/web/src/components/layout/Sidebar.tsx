// src/components/layout/Sidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Activity, Users, Building2, Globe, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { useCurrentUser, useAppSelector } from '@/hooks';

const NAV = [
  { label: 'Customers',         href: ROUTES.customers.list,           icon: LayoutDashboard, roles: ['ADMIN','MEMBER','SUPER_ADMIN'] },
  { label: 'Activity Log',      href: ROUTES.activity.list,            icon: Activity,        roles: ['ADMIN','MEMBER','SUPER_ADMIN'] },
  { label: 'Users',             href: ROUTES.users.list,               icon: Users,           roles: ['ADMIN','SUPER_ADMIN'] },
  { label: 'My Organization',   href: ROUTES.admin.organizations,      icon: Building2,       roles: ['ADMIN'] },
  { label: 'Global Customers',  href: ROUTES.superadmin.customers,     icon: Globe,           roles: ['SUPER_ADMIN'] },
  { label: 'All Organizations', href: ROUTES.superadmin.organizations, icon: Building2,       roles: ['SUPER_ADMIN'] },
  { label: 'Global Activity',   href: ROUTES.superadmin.activity,      icon: Activity,        roles: ['SUPER_ADMIN'] },
];

export function Sidebar() {
  const pathname     = usePathname();
  const { user }     = useCurrentUser();
  const sidebarOpen  = useAppSelector((s) => s.ui.sidebarOpen);

  if (!sidebarOpen || !user) return null;

  const visible = NAV.filter((n) => n.roles.includes(user.role));

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-card border-r z-30 flex flex-col">
      <div className="h-16 flex items-center px-5 border-b">
        <span className="text-lg font-bold text-primary">CRM</span>
        <span className="text-lg font-medium ml-1">System</span>
      </div>

      {user.isSuperAdmin && (
        <div className="mx-3 mt-3 px-3 py-1.5 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 text-destructive" />
          <span className="text-xs font-semibold text-destructive">Super Admin Mode</span>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visible.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
