// src/hooks/use-customer-detail.ts
'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { CustomerWithNotes, ActivityLog, Note } from '@crm/types';
import { customerService, activityService } from '@/lib/api/services';
import { extractApiError } from '@/lib/utils';

export function useCustomerDetail(id: string) {
  const [customer,  setCustomer]  = useState<CustomerWithNotes | null>(null);
  const [activity,  setActivity]  = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    Promise.all([
      customerService.getOne(id),
      activityService.byCustomer(id),
    ])
      .then(([c, a]) => {
        setCustomer(c);
        setActivity(a.data);
      })
      .catch((e) => {
        const msg = extractApiError(e);
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const addNote = (note: Note) => {
    setCustomer((prev) =>
      prev
        ? { ...prev, notes: [note as CustomerWithNotes['notes'][number], ...prev.notes] }
        : prev,
    );
  };

  return { customer, activity, isLoading, error, addNote };
}
