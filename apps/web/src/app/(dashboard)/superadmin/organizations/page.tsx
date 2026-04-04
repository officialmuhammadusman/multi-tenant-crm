// src/app/(dashboard)/superadmin/organizations/page.tsx — super admin orgs
'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Organization } from '@crm/types';
import { useOrganizations } from '@/hooks';
import { formatDate } from '@/lib/utils';
import { EMPTY_MESSAGES } from '@/constants';
import { PageHeader }   from '@/components/layout/PageHeader';
import { Button }       from '@/components/ui/button';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateOrganizationForm } from '@/components/organizations/CreateOrganizationForm';

export default function SuperAdminOrganizationsPage() {
  const { organizations, isLoading, addOrganization } = useOrganizations();
  const [open, setOpen] = useState(false);

  const columns: ColumnDef<Organization>[] = [
    { key: 'name',    header: 'Name',         render: (o) => <span className="font-medium">{o.name}</span> },
    { key: 'members', header: 'Members',      render: (o) => <span className="text-sm">{(o as Organization & { memberCount?: number }).memberCount ?? '—'}</span> },
    { key: 'cust',    header: 'Customers',    render: (o) => <span className="text-sm">{(o as Organization & { customerCount?: number }).customerCount ?? '—'}</span> },
    { key: 'date',    header: 'Created',      render: (o) => <span className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="All Organizations"
        subtitle="Global organization management"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />New organization</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create organization</DialogTitle></DialogHeader>
              <CreateOrganizationForm
                onSuccess={(o) => { addOrganization(o); setOpen(false); }}
                onCancel={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable columns={columns} data={organizations} isLoading={isLoading} rowKey={(o) => o.id} emptyMessage={EMPTY_MESSAGES.organizations} />
    </div>
  );
}
