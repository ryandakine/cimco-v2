import { useState, useCallback } from 'react';
import type { ApiError } from '@/api/client';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T, Args extends unknown[]> extends UseApiState<T> {
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T, Args extends unknown[] = unknown[]>(
  apiFunction: (...args: Args) => Promise<T>
): UseApiReturn<T, Args> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (...args: Args): Promise<T | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await apiFunction(...args);
      setState({ data, isLoading: false, error: null });
      return data;
    } catch (error) {
      const apiError = error as ApiError;
      setState({ data: null, isLoading: false, error: apiError });
      return null;
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for API calls that should only run on user action
export function useApiAction<T, Args extends unknown[] = unknown[]>(
  apiFunction: (...args: Args) => Promise<T>
): UseApiReturn<T, Args> {
  return useApi(apiFunction);
}
