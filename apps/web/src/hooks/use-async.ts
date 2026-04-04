// src/hooks/use-async.ts
// Generic hook that wraps any async operation.
// Eliminates try/catch boilerplate in every component.
// Components only handle onSuccess / onError callbacks.
import { useState, useCallback, useRef, useEffect } from 'react';
import { extractApiError } from '@/lib/utils';

export interface AsyncState<T> {
  data:      T | null;
  isLoading: boolean;
  error:     string | null;
}

export interface UseAsyncReturn<T> extends AsyncState<T> {
  run: (
    fn: () => Promise<T>,
    opts?: {
      onSuccess?: (data: T) => void;
      onError?:   (message: string) => void;
    },
  ) => Promise<T | null>;
  reset: () => void;
}

export function useAsync<T>(): UseAsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null, isLoading: false, error: null,
  });

  // Track mounted state to avoid setState after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const run = useCallback(async (
    fn: () => Promise<T>,
    opts?: { onSuccess?: (data: T) => void; onError?: (msg: string) => void },
  ): Promise<T | null> => {
    if (mountedRef.current) {
      setState({ data: null, isLoading: true, error: null });
    }

    try {
      const result = await fn();
      if (mountedRef.current) {
        setState({ data: result, isLoading: false, error: null });
        opts?.onSuccess?.(result);
      }
      return result;
    } catch (err: unknown) {
      const message = extractApiError(err);
      if (mountedRef.current) {
        setState({ data: null, isLoading: false, error: message });
        opts?.onError?.(message);
      }
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, run, reset };
}
