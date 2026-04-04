// src/app/(dashboard)/activity/page.tsx — uses useActivity hook, pure UI
'use client';
import { useActivity, useCurrentUser } from '@/hooks';
import { formatDateTime } from '@/lib/utils';
import { EMPTY_MESSAGES } from '@/constants';
import { PageHeader }    from '@/components/layout/PageHeader';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { ActivityBadge } from '@/components/ui/activity-badge';
import type { ActivityLog } from '@crm/types';

export default function ActivityPage() {
  const { logs, hasMore, isLoading, isFetching, pagination, goNext } = useActivity();
  const { isSuperAdmin } = useCurrentUser();

  const columns: ColumnDef<ActivityLog>[] = [
    { key: 'label',  header: 'Label',        render: (l) => <ActivityBadge action={l.action} /> },
    { key: 'entity', header: 'Entity type',  render: (l) => <span className="text-muted-foreground text-sm">{l.entityType}</span> },
    { key: 'by',     header: 'Performed by', render: (l) => <span className="text-sm">{l.performer?.name ?? '—'}</span> },
    ...(isSuperAdmin
      ? [{ key: 'org', header: 'Organization', render: (l: ActivityLog) => <span className="text-sm text-muted-foreground">{l.organization?.name ?? '—'}</span> }]
      : []),
    { key: 'time',   header: 'Timestamp',    render: (l) => <span className="text-sm text-muted-foreground">{formatDateTime(l.timestamp)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Activity Log" subtitle="All events within your organization" />
      <DataTable columns={columns} data={logs} isLoading={isLoading} rowKey={(l) => l.id} emptyMessage={EMPTY_MESSAGES.activity} />
      <PaginationBar hasPrev={pagination.hasPrev} hasMore={hasMore} onPrev={pagination.goPrev} onNext={goNext} isFetching={isFetching} />
    </div>
  );
}
