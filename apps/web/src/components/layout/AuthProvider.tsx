// src/components/layout/AuthProvider.tsx
'use client';
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { clearCredentials, setInitialized, updateAccessToken, refreshTokenThunk } from '@/store/slices/auth.slice';
import { setAxiosToken } from '@/lib/api/axios-instance';
import { ROUTES } from '@/lib/routes';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { accessToken } = useAppSelector((s) => s.auth);

  const handleTokenRefreshed = useCallback((e: Event) => {
    const { accessToken: t } = (e as CustomEvent<{ accessToken: string }>).detail;
    dispatch(updateAccessToken(t));
  }, [dispatch]);

  const handleLogout = useCallback(() => {
    dispatch(clearCredentials());
    document.cookie = 'crm_auth_role=; path=/; max-age=0';
    router.push(ROUTES.auth.login);
  }, [dispatch, router]);

  useEffect(() => {
    window.addEventListener('token:refreshed', handleTokenRefreshed);
    window.addEventListener('auth:logout', handleLogout);
    return () => {
      window.removeEventListener('token:refreshed', handleTokenRefreshed);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [handleTokenRefreshed, handleLogout]);

  // Proactive refresh 60s before expiry
  useEffect(() => {
    if (!accessToken) { dispatch(setInitialized()); return; }
    try {
      const { exp } = JSON.parse(atob(accessToken.split('.')[1]!)) as { exp: number };
      const ms = exp * 1000 - Date.now() - 60_000;
      if (ms <= 0) { dispatch(refreshTokenThunk()); return; }
      const t = setTimeout(() => dispatch(refreshTokenThunk()), ms);
      return () => clearTimeout(t);
    } catch { dispatch(setInitialized()); }
  }, [accessToken, dispatch]);

  useEffect(() => { if (accessToken) setAxiosToken(accessToken); }, [accessToken]);

  return <>{children}</>;
}
