import { Badge } from '@/components/ui/badge';

const roleConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  SUPER_ADMIN: { label: 'Super Admin', variant: 'destructive' },
  ADMIN:       { label: 'Admin',       variant: 'default'     },
  MEMBER:      { label: 'Member',      variant: 'secondary'   },
};

export function RoleBadge({ role }: { role: string }) {
  const config = roleConfig[role] ?? { label: role, variant: 'outline' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
