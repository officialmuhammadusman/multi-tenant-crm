// src/app/(dashboard)/superadmin/customers/page.tsx — super admin global customers
'use client';
import { useState } from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import type { Customer } from '@crm/types';
import { useCustomers, useCurrentUser } from '@/hooks';
import { formatDate } from '@/lib/utils';
import { ROUTES, EMPTY_MESSAGES } from '@/constants';
import { PageHeader }    from '@/components/layout/PageHeader';
import { Badge }         from '@/components/ui/badge';
import { Button }        from '@/components/ui/button';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { SearchInput }   from '@/components/ui/search-input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function SuperAdminCustomersPage() {
  const { customers, hasMore, isLoading, isFetching, setSearch, pagination, goNext, softDelete, restore } = useCustomers();

  const columns: ColumnDef<Customer>[] = [
    {
      key: 'name', header: 'Name',
      render: (c) => <Link href={ROUTES.customers.detail(c.id)} className="font-medium text-primary hover:underline">{c.name}</Link>,
    },
    { key: 'email', header: 'Email',        render: (c) => <span className="text-sm text-muted-foreground">{c.email}</span> },
    { key: 'org',   header: 'Organization', render: (c) => <span className="text-sm">{(c as Customer & { organization?: { name: string } }).organization?.name ?? '—'}</span> },
    { key: 'assigned', header: 'Assigned To', render: (c) => c.assignedUser ? <span className="text-sm">{c.assignedUser.name}</span> : <Badge variant="outline" className="text-xs">Unassigned</Badge> },
    { key: 'status', header: 'Status', render: (c) => c.deletedAt ? <Badge variant="destructive">Deleted</Badge> : <Badge variant="success">Active</Badge> },
    { key: 'date',   header: 'Created', render: (c) => <span className="text-sm text-muted-foreground">{formatDate(c.createdAt)}</span> },
    {
      key: 'actions', header: '', className: 'text-right',
      render: (c) => (
        <div className="flex items-center gap-1 justify-end">
          {!c.deletedAt && (
            <ConfirmDialog
              trigger={<Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>}
              title="Delete customer" description={`Delete ${c.name}?`}
              confirmLabel="Delete" variant="destructive" onConfirm={() => softDelete(c.id)}
            />
          )}
          {c.deletedAt && (
            <Button variant="ghost" size="icon" onClick={() => restore(c.id)}><RotateCcw className="h-4 w-4 text-success-600" /></Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="All Customers" subtitle="Global view across all organizations" />
      <div className="mb-4"><SearchInput onSearch={setSearch} placeholder="Search customers..." isLoading={isFetching} className="max-w-sm" /></div>
      <DataTable columns={columns} data={customers} isLoading={isLoading} rowKey={(c) => c.id} emptyMessage={EMPTY_MESSAGES.customers} />
      <PaginationBar hasPrev={pagination.hasPrev} hasMore={hasMore} onPrev={pagination.goPrev} onNext={goNext} isFetching={isFetching} />
    </div>
  );
}
