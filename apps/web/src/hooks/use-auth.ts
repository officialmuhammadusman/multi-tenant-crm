// src/hooks/use-auth.ts
// Login and logout logic fully separated from UI components.
'use client';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { LoginDto } from '@crm/types';
import { useAppDispatch, useAppSelector } from './use-app-store';
import { loginThunk, logoutThunk } from '@/store/slices/auth.slice';
import { ROUTES } from '@/lib/routes';
import { TOAST } from '@/constants';

export function useAuth() {
  const dispatch  = useAppDispatch();
  const router    = useRouter();
  const isLoading = useAppSelector((s) => s.auth.isLoading);
  const error     = useAppSelector((s) => s.auth.error);

  const login = useCallback(async (dto: LoginDto) => {
    const result = await dispatch(loginThunk(dto));

    if (loginThunk.fulfilled.match(result)) {
      const { user } = result.payload;
      toast.success(TOAST.login.success(user.name));
      // Route based on role
      router.push(user.isSuperAdmin ? ROUTES.superadmin.customers : ROUTES.customers.list);
      return true;
    }

    toast.error((result.payload as string) ?? TOAST.login.error);
    return false;
  }, [dispatch, router]);

  const logout = useCallback(async () => {
    await dispatch(logoutThunk());
    toast.success(TOAST.auth.logoutSuccess);
    router.push(ROUTES.auth.login);
  }, [dispatch, router]);

  return { login, logout, isLoading, error };
}
