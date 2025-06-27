import { useState, useEffect } from 'react';
import { handleApiError, showErrorToast } from '../utils/errorHandler';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApi<T>(
  apiFunction: () => Promise<any>,
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = async (...args: any[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiFunction(...args);
      const data = response.data;
      
      setState({
        data,
        loading: false,
        error: null,
      });
      
      if (onSuccess) {
        onSuccess(data);
      }
      
      return data;
    } catch (error) {
      const appError = handleApiError(error);
      
      setState({
        data: null,
        loading: false,
        error: appError.message,
      });
      
      if (onError) {
        onError(appError);
      } else {
        showErrorToast(appError);
      }
      
      throw appError;
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return {
    ...state,
    execute,
    refetch: execute,
  };
}

// Specialized hook for mutations (create, update, delete)
export function useMutation<T>(
  apiFunction: (...args: any[]) => Promise<any>,
  options: UseApiOptions = {}
) {
  return useApi<T>(apiFunction, { ...options, immediate: false });
}

// Hook for paginated data
interface UsePaginatedApiOptions extends UseApiOptions {
  initialPage?: number;
  pageSize?: number;
}

export function usePaginatedApi<T>(
  apiFunction: (page: number, pageSize: number) => Promise<any>,
  options: UsePaginatedApiOptions = {}
) {
  const { initialPage = 1, pageSize = 10, ...apiOptions } = options;
  const [page, setPage] = useState(initialPage);
  
  const { data, loading, error, execute } = useApi<{
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>(
    () => apiFunction(page, pageSize),
    { ...apiOptions, immediate: false }
  );

  useEffect(() => {
    execute();
  }, [page]);

  const nextPage = () => {
    if (data && page < data.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && data && newPage <= data.totalPages) {
      setPage(newPage);
    }
  };

  return {
    data,
    loading,
    error,
    page,
    nextPage,
    prevPage,
    goToPage,
    refetch: execute,
  };
}