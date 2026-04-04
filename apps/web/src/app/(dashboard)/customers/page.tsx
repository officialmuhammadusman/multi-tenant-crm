// src/app/(dashboard)/customers/page.tsx
// Pure UI — all logic delegated to useCustomers hook
'use client';
import { useState } from 'react';
import { Plus, Pencil, Trash2, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import type { Customer } from '@crm/types';
import { useCustomers, useCurrentUser } from '@/hooks';
import { formatDate } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { EMPTY_MESSAGES } from '@/constants';
import { PageHeader }           from '@/components/layout/PageHeader';
import { Button }               from '@/components/ui/button';
import { Badge }                from '@/components/ui/badge';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { PaginationBar }        from '@/components/ui/pagination-bar';
import { SearchInput }          from '@/components/ui/search-input';
import { ConfirmDialog }        from '@/components/ui/confirm-dialog';
import { ErrorBanner }          from '@/components/ui/error-banner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CustomerForm }         from '@/components/customers/CustomerForm';
import { AssignCustomerDropdown } from '@/components/customers/AssignCustomerDropdown';

export default function CustomersPage() {
  const {
    customers, hasMore, isLoading, isFetching,
    search, setSearch, pagination, goNext,
    softDelete, restore, addCustomer, updateCustomer,
  } = useCustomers();

  const { user, canDeleteCustomer, canRestoreCustomer, canAssignCustomer, canEditCustomer } = useCurrentUser();

  const [createOpen,    setCreateOpen]    = useState(false);
  const [editCustomer,  setEditCustomer]  = useState<Customer | null>(null);

  const columns: ColumnDef<Customer>[] = [
    {
      key: 'name', header: 'Name',
      render: (c) => (
        <Link href={ROUTES.customers.detail(c.id)} className="font-medium text-primary hover:underline">
          {c.name}
        </Link>
      ),
    },
    { key: 'email', header: 'Email', render: (c) => <span className="text-muted-foreground text-sm">{c.email}</span> },
    { key: 'phone', header: 'Phone', render: (c) => <span className="text-muted-foreground text-sm">{c.phone ?? '—'}</span> },
    {
      key: 'assigned', header: 'Assigned To',
      render: (c) => c.assignedUser
        ? <span className="text-sm">{c.assignedUser.name}</span>
        : <Badge variant="outline" className="text-xs">Unassigned</Badge>,
    },
    {
      key: 'status', header: 'Status',
      render: (c) => c.deletedAt
        ? <Badge variant="destructive">Deleted</Badge>
        : <Badge variant="success">Active</Badge>,
    },
    { key: 'date', header: 'Created', render: (c) => <span className="text-sm text-muted-foreground">{formatDate(c.createdAt)}</span> },
    {
      key: 'actions', header: '', className: 'text-right',
      render: (c) => (
        <div className="flex items-center gap-1 justify-end">
          {canAssignCustomer && !c.deletedAt && (
            <AssignCustomerDropdown customer={c} onAssigned={updateCustomer} />
          )}
          {canEditCustomer(c.assignedTo) && !c.deletedAt && (
            <Button variant="ghost" size="icon" onClick={() => setEditCustomer(c)} title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {canDeleteCustomer && !c.deletedAt && (
            <ConfirmDialog
              trigger={<Button variant="ghost" size="icon" title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>}
              title="Delete customer"
              description={`Delete ${c.name}? Notes and activity will be preserved.`}
              confirmLabel="Delete" variant="destructive"
              onConfirm={() => softDelete(c.id)}
            />
          )}
          {canRestoreCustomer && c.deletedAt && (
            <Button variant="ghost" size="icon" onClick={() => restore(c.id)} title="Restore">
              <RotateCcw className="h-4 w-4 text-success-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Manage your organization's customers"
        action={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />New customer</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create customer</DialogTitle></DialogHeader>
              <CustomerForm
                mode="create"
                onSuccess={(c) => { addCustomer(c); setCreateOpen(false); }}
                onCancel={() => setCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4">
        <SearchInput
          onSearch={setSearch}
          placeholder="Search by name or email..."
          isLoading={isFetching}
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        rowKey={(c) => c.id}
        emptyMessage={EMPTY_MESSAGES.customers}
      />

      <PaginationBar
        hasPrev={pagination.hasPrev}
        hasMore={hasMore}
        onPrev={pagination.goPrev}
        onNext={goNext}
        isFetching={isFetching}
      />

      {/* Edit dialog */}
      <Dialog open={!!editCustomer} onOpenChange={(o) => !o && setEditCustomer(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit customer</DialogTitle></DialogHeader>
          {editCustomer && (
            <CustomerForm
              mode="edit"
              customer={editCustomer}
              onSuccess={(c) => { updateCustomer(c); setEditCustomer(null); }}
              onCancel={() => setEditCustomer(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
