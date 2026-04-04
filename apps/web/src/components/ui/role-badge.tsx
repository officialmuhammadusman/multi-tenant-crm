// src/components/ui/role-badge.tsx
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

export function RoleBadge({ role }: { role: string }) {
  const cls = theme.roleColors[role] ?? 'bg-gray-100 text-gray-700';
  const label = role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'ADMIN' ? 'Admin' : 'Member';
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', cls)}>
      {label}
    </span>
  );
}
