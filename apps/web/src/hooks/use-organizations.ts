// src/hooks/use-organizations.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Organization } from '@crm/types';
import { organizationService } from '@/lib/api/services';
import { extractApiError } from '@/lib/utils';
import { TOAST } from '@/constants';

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [error,         setError]         = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setOrganizations(await organizationService.list());
    } catch (e) {
      const msg = extractApiError(e);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addOrganization = (org: Organization) => {
    setOrganizations((prev) => [org, ...prev]);
    toast.success(TOAST.organization.created(org.name));
  };

  return { organizations, isLoading, error, addOrganization, refetch: fetch };
}
