// apps/api/src/common/context/request-context.ts
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  userId: string;
  organizationId: string | null;
  role: string;
  isSuperAdmin: boolean;
  correlationId: string;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

export function getRequiredContext(): RequestContext {
  const ctx = requestContextStorage.getStore();
  if (!ctx) throw new Error('RequestContext not available outside a request scope');
  return ctx;
}
