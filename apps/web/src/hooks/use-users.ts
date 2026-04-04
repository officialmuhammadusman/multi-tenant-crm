// src/hooks/use-users.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { User } from '@crm/types';
import { userService } from '@/lib/api/services';
import { extractApiError } from '@/lib/utils';
import { TOAST } from '@/constants';

export function useUsers(organizationId?: string) {
  const [users,     setUsers]     = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.list(organizationId);
      setUsers(data);
    } catch (e) {
      const msg = extractApiError(e);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addUser = (user: User) => {
    setUsers((prev) => [...prev, user]);
    toast.success(TOAST.user.created(user.name));
  };

  return { users, isLoading, error, addUser, refetch: fetch };
}
