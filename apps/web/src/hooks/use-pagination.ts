// src/hooks/use-pagination.ts
import { useState, useCallback } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/constants';

export interface PaginationState {
  cursor:    string | undefined;
  hasPrev:   boolean;
  limit:     number;
  goNext:    (nextCursor: string) => void;
  goPrev:    () => void;
  reset:     () => void;
}

export function usePagination(limit: number = DEFAULT_PAGE_SIZE): PaginationState {
  // Stack stores all previous cursors so we can go backwards
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [cursor, setCursor]           = useState<string | undefined>(undefined);

  const goNext = useCallback((nextCursor: string) => {
    setCursorStack((prev) => [...prev, nextCursor]);
    setCursor(nextCursor);
  }, []);

  const goPrev = useCallback(() => {
    setCursorStack((prev) => {
      const next = prev.slice(0, -1);
      setCursor(next[next.length - 1]);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setCursorStack([]);
    setCursor(undefined);
  }, []);

  return { cursor, hasPrev: cursorStack.length > 0, limit, goNext, goPrev, reset };
}
