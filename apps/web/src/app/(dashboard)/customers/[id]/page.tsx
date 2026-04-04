// src/app/(dashboard)/customers/[id]/page.tsx — uses useCustomerDetail hook
'use client';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, User2 } from 'lucide-react';
import type { ActivityLog } from '@crm/types';
import { useCustomerDetail, useCurrentUser } from '@/hooks';
import { formatDate, formatDateTime, formatRelativeTime } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { EMPTY_MESSAGES } from '@/constants';
import { PageHeader }    from '@/components/layout/PageHeader';
import { Button }        from '@/components/ui/button';
import { Badge }         from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton }      from '@/components/ui/skeleton';
import { ErrorBanner }   from '@/components/ui/error-banner';
import { ActivityBadge } from '@/components/ui/activity-badge';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { NoteForm }      from '@/components/notes/NoteForm';

interface Props { params: Promise<{ id: string }> }

export default function CustomerDetailPage({ params }: Props) {
  const { id }                        = use(params);
  const { customer, activity, isLoading, error, addNote } = useCustomerDetail(id);
  const { canEditCustomer }           = useCurrentUser();

  const activityCols: ColumnDef<ActivityLog>[] = [
    { key: 'label', header: 'Label',        render: (l) => <ActivityBadge action={l.action} /> },
    { key: 'by',    header: 'Performed by', render: (l) => <span className="text-sm">{l.performer?.name ?? '—'}</span> },
    { key: 'time',  header: 'Timestamp',    render: (l) => <span className="text-sm text-muted-foreground">{formatDateTime(l.timestamp)}</span> },
  ];

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  if (error || !customer) return (
    <div className="space-y-4">
      <Link href={ROUTES.customers.list}><Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
      <ErrorBanner message={error ?? 'Customer not found.'} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={ROUTES.customers.list}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <PageHeader title={customer.name} subtitle={customer.email} className="mb-0" />
        </div>
        <div className="flex items-center gap-2">
          {customer.deletedAt ? <Badge variant="destructive">Deleted</Badge> : <Badge variant="success">Active</Badge>}
          {canEditCustomer(customer.assignedTo) && !customer.deletedAt && (
            <Link href={ROUTES.customers.edit(customer.id)}>
              <Button variant="outline" size="sm">Edit</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Details card */}
      <Card>
        <CardHeader><CardTitle>Customer details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-muted-foreground mb-1">Email</p><p className="font-medium">{customer.email}</p></div>
          <div><p className="text-muted-foreground mb-1">Phone</p><p className="font-medium">{customer.phone ?? '—'}</p></div>
          <div><p className="text-muted-foreground mb-1">Assigned to</p><p className="font-medium">{customer.assignedUser?.name ?? 'Unassigned'}</p></div>
          <div><p className="text-muted-foreground mb-1">Created</p><p className="font-medium">{formatDate(customer.createdAt)}</p></div>
        </CardContent>
      </Card>

      {/* Notes — always shown below customer info, never on a separate tab */}
      <Card>
        <CardHeader><CardTitle>Notes ({customer.notes.length})</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {customer.notes.length === 0
            ? <p className="text-muted-foreground text-sm">{EMPTY_MESSAGES.notes}</p>
            : customer.notes.map((note) => (
                <div key={note.id} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                  <p className="text-sm leading-relaxed">{note.content}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User2 className="h-3 w-3" />{note.creator?.name ?? '—'}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeTime(note.createdAt)}</span>
                  </div>
                </div>
              ))
          }
          {!customer.deletedAt && (
            <div className="pt-2 border-t">
              <NoteForm customerId={id} onSuccess={addNote} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity */}
      <Card>
        <CardHeader><CardTitle>Activity ({activity.length})</CardTitle></CardHeader>
        <CardContent>
          <DataTable columns={activityCols} data={activity} rowKey={(a) => a.id} emptyMessage={EMPTY_MESSAGES.activity} />
        </CardContent>
      </Card>
    </div>
  );
}
