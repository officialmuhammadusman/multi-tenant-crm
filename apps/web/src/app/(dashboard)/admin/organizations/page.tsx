// src/app/(dashboard)/admin/organizations/page.tsx — admin: own org detail
'use client';
import { useCurrentUser, useUsers } from '@/hooks';
import { formatDate } from '@/lib/utils';
import { EMPTY_MESSAGES } from '@/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { RoleBadge }  from '@/components/ui/role-badge';
import { Skeleton }   from '@/components/ui/skeleton';
import type { User }  from '@crm/types';

export default function AdminOrganizationsPage() {
  const { user }               = useCurrentUser();
  const { users, isLoading }   = useUsers(user?.organizationId ?? undefined);

  const columns: ColumnDef<User>[] = [
    { key: 'name',  header: 'Name',   render: (u) => <span className="font-medium">{u.name}</span> },
    { key: 'email', header: 'Email',  render: (u) => <span className="text-muted-foreground text-sm">{u.email}</span> },
    { key: 'role',  header: 'Role',   render: (u) => <RoleBadge role={u.role} /> },
    { key: 'date',  header: 'Joined', render: (u) => <span className="text-sm text-muted-foreground">{formatDate(u.createdAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="My Organization" />
      <Card>
        <CardHeader>
          <CardTitle>{isLoading ? <Skeleton className="h-5 w-40" /> : user?.organizationId ? 'Organization details' : '—'}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Organization ID: <span className="font-mono text-foreground">{user?.organizationId ?? '—'}</span></p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Members ({users.length})</CardTitle></CardHeader>
        <CardContent>
          <DataTable columns={columns} data={users} isLoading={isLoading} rowKey={(u) => u.id} emptyMessage={EMPTY_MESSAGES.users} />
        </CardContent>
      </Card>
    </div>
  );
}
