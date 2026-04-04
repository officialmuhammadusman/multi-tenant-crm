// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { ROUTES, PROTECTED_ROUTES, ADMIN_ROUTES, SUPERADMIN_ROUTES } from '@/lib/routes';
import { AUTH_ROLE_COOKIE } from '@/constants';

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value;
  const isAuthenticated = !!role;
  const isSuperAdmin    = role === 'SUPER_ADMIN';
  const isAdmin         = role === 'ADMIN' || isSuperAdmin;

  // ── Static assets & API — always pass through ─────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // ── Authenticated user on login page → redirect to dashboard ──────────────
  if (pathname === ROUTES.auth.login && isAuthenticated) {
    const dest = isSuperAdmin ? ROUTES.superadmin.customers : ROUTES.customers.list;
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // ── Unauthenticated user on protected route → redirect to login ───────────
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (isProtected && !isAuthenticated) {
    const url = new URL(ROUTES.auth.login, request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // ── Super admin routes → 404 for non-super-admins ─────────────────────────
  const isSuperAdminRoute = SUPERADMIN_ROUTES.some((r) => pathname.startsWith(r));
  if (isSuperAdminRoute && !isSuperAdmin) {
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }

  // ── Admin routes → 404 for members ───────────────────────────────────────
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  if (isAdminRoute && !isAdmin) {
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
