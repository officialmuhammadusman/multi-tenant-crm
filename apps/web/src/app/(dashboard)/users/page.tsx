// src/app/(dashboard)/users/page.tsx — uses useUsers hook, pure UI
'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { User } from '@crm/types';
import { useUsers, useCurrentUser } from '@/hooks';
import { formatDate } from '@/lib/utils';
import { EMPTY_MESSAGES } from '@/constants';
import { PageHeader }   from '@/components/layout/PageHeader';
import { Button }       from '@/components/ui/button';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { RoleBadge }    from '@/components/ui/role-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateUserForm } from '@/components/users/CreateUserForm';

export default function UsersPage() {
  const { users, isLoading, addUser }    = useUsers();
  const { canCreateUser }                = useCurrentUser();
  const [open, setOpen]                  = useState(false);

  const columns: ColumnDef<User>[] = [
    { key: 'name',      header: 'Name',    render: (u) => <span className="font-medium">{u.name}</span> },
    { key: 'email',     header: 'Email',   render: (u) => <span className="text-muted-foreground text-sm">{u.email}</span> },
    { key: 'role',      header: 'Role',    render: (u) => <RoleBadge role={u.role} /> },
    { key: 'createdAt', header: 'Joined',  render: (u) => <span className="text-sm text-muted-foreground">{formatDate(u.createdAt)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Members of your organization"
        action={
          canCreateUser && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" />New user</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create user</DialogTitle></DialogHeader>
                <CreateUserForm
                  onSuccess={(u) => { addUser(u); setOpen(false); }}
                  onCancel={() => setOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )
        }
      />
      <DataTable columns={columns} data={users} isLoading={isLoading} rowKey={(u) => u.id} emptyMessage={EMPTY_MESSAGES.users} />
    </div>
  );
}
