// src/app/(dashboard)/superadmin/activity/page.tsx — global activity log
'use client';
import { useActivity } from '@/hooks';
import { formatDateTime } from '@/lib/utils';
import { EMPTY_MESSAGES } from '@/constants';
import { PageHeader }    from '@/components/layout/PageHeader';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { ActivityBadge } from '@/components/ui/activity-badge';
import type { ActivityLog } from '@crm/types';

export default function SuperAdminActivityPage() {
  const { logs, hasMore, isLoading, isFetching, pagination, goNext } = useActivity();

  const columns: ColumnDef<ActivityLog>[] = [
    { key: 'label',  header: 'Label',         render: (l) => <ActivityBadge action={l.action} /> },
    { key: 'entity', header: 'Entity type',   render: (l) => <span className="text-sm text-muted-foreground">{l.entityType}</span> },
    { key: 'org',    header: 'Organization',  render: (l) => <span className="text-sm">{l.organization?.name ?? '—'}</span> },
    { key: 'by',     header: 'Performed by',  render: (l) => <span className="text-sm">{l.performer?.name ?? '—'}</span> },
    { key: 'time',   header: 'Timestamp',     render: (l) => <span className="text-sm text-muted-foreground">{formatDateTime(l.timestamp)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Global Activity Log" subtitle="All events across every organization" />
      <DataTable columns={columns} data={logs} isLoading={isLoading} rowKey={(l) => l.id} emptyMessage={EMPTY_MESSAGES.activity} />
      <PaginationBar hasPrev={pagination.hasPrev} hasMore={hasMore} onPrev={pagination.goPrev} onNext={goNext} isFetching={isFetching} />
    </div>
  );
}
