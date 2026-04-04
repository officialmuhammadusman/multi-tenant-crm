// src/hooks/use-activity.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { ActivityLog, ActivityQuery } from '@crm/types';
import { activityService } from '@/lib/api/services';
import { extractApiError } from '@/lib/utils';
import { usePagination } from './use-pagination';

export function useActivity(initialQuery?: Partial<ActivityQuery>) {
  const [logs,       setLogs]       = useState<ActivityLog[]>([]);
  const [hasMore,    setHasMore]    = useState(false);
  const [isLoading,  setIsLoading]  = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [filters,    setFilters]    = useState<Partial<ActivityQuery>>(initialQuery ?? {});
  const pagination                  = usePagination();

  const fetch = useCallback(async (query: ActivityQuery) => {
    query.cursor ? setIsFetching(true) : setIsLoading(true);
    try {
      const res = await activityService.list(query);
      setLogs(res.data);
      setHasMore(res.hasMore);
    } catch (e) {
      toast.error(extractApiError(e));
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    pagination.reset();
    fetch({ ...filters, limit: pagination.limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    fetch({ ...filters, cursor: pagination.cursor, limit: pagination.limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.cursor]);

  const goNext = useCallback(() => {
    const last = logs[logs.length - 1];
    if (last && hasMore) pagination.goNext(last.id);
  }, [logs, hasMore, pagination]);

  return { logs, hasMore, isLoading, isFetching, filters, setFilters, pagination, goNext };
}
