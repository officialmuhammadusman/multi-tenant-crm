// src/lib/utils.ts
// Pure utility functions — no React, no state, no side effects.
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

// ── Tailwind class merger ─────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ── Date formatters ───────────────────────────────────────────────────────────
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy HH:mm');
}

// ── String helpers ────────────────────────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}…` : str;
}

// ── Query string builder ──────────────────────────────────────────────────────
export function buildQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  return search.toString();
}

// ── API error extractor ───────────────────────────────────────────────────────
// Reads the ApiResponse shape from the backend — never throws a raw error string.
export function extractApiError(error: unknown): string {
  if (error && typeof error === 'object') {
    // Axios error with response body
    const axErr = error as {
      response?: { data?: { message?: string; error?: string } };
      message?: string;
    };
    if (axErr.response?.data?.message) return axErr.response.data.message;
    if (axErr.response?.data?.error)   return axErr.response.data.error;
    if (axErr.message)                 return axErr.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

// ── JWT decoder (no verification — just reading claims for UI) ────────────────
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    return JSON.parse(atob(part)) as T;
  } catch {
    return null;
  }
}

// ── Cookie helpers ────────────────────────────────────────────────────────────
export function setCookie(name: string, value: string, maxAge: number): void {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Strict`;
}

export function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0`;
}
