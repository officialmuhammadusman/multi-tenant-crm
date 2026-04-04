// src/hooks/use-customers.ts
// All customer data-fetching and mutation logic.
// The customers page imports THIS — not the service directly.
'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Customer, PaginationQuery } from '@crm/types';
import { customerService } from '@/lib/api/services';
import { extractApiError } from '@/lib/utils';
import { usePagination } from './use-pagination';
import { useDebounce } from './use-debounce';
import { TOAST } from '@/constants';

export function useCustomers() {
  const [customers,   setCustomers]   = useState<Customer[]>([]);
  const [hasMore,     setHasMore]     = useState(false);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isFetching,  setIsFetching]  = useState(false);
  const [search,      setSearch]      = useState('');
  const debouncedSearch               = useDebounce(search);
  const pagination                    = usePagination();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetch = useCallback(async (query: PaginationQuery) => {
    query.cursor ? setIsFetching(true) : setIsLoading(true);
    try {
      const res = await customerService.list(query);
      setCustomers(res.data);
      setHasMore(res.hasMore);
    } catch (e) {
      toast.error(extractApiError(e));
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, []);

  // Reset pagination and reload when search changes
  useEffect(() => {
    pagination.reset();
    fetch({ search: debouncedSearch, limit: pagination.limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Reload when page changes
  useEffect(() => {
    fetch({ cursor: pagination.cursor, search: debouncedSearch, limit: pagination.limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.cursor]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const softDelete = useCallback(async (id: string) => {
    try {
      await customerService.softDelete(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      toast.success(TOAST.customer.deleted);
    } catch (e) {
      toast.error(extractApiError(e));
    }
  }, []);

  const restore = useCallback(async (id: string) => {
    try {
      const updated = await customerService.restore(id);
      setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
      toast.success(TOAST.customer.restored);
    } catch (e) {
      toast.error(extractApiError(e));
    }
  }, []);

  const addCustomer = useCallback((customer: Customer) => {
    setCustomers((prev) => [customer, ...prev]);
  }, []);

  const updateCustomer = useCallback((updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }, []);

  const goNext = useCallback(() => {
    const last = customers[customers.length - 1];
    if (last && hasMore) pagination.goNext(last.id);
  }, [customers, hasMore, pagination]);

  return {
    customers,
    hasMore,
    isLoading,
    isFetching,
    search,
    setSearch,
    pagination,
    goNext,
    softDelete,
    restore,
    addCustomer,
    updateCustomer,
  };
}
